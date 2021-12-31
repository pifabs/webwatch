'use-strict';

const superagent = require('superagent');

const webwatch = require('../../index');
const { Channel, Settings, Job, SiteStatus } = webwatch.models;
const utils = webwatch.utils;


async function addJob(channel) {
	const { SiteCheckQueue } = webwatch.queues;
	const settings = await Settings.get(channel);
	const newJob = await SiteCheckQueue.add({
		channel
	}, {
		jobId: channel,
		repeat: {
			key: channel,
			cron: settings.schedule
		}
	});
	const job = new Job({
		channelId: channel,
		repeatKey: newJob.opts.repeat.key
	});
	await job.save();
	return;
}


async function removeJob(channel) {
	const { SiteCheckQueue } = webwatch.queues;
	// SiteCheckQueue.obliterate({ force: true });
	const job = await Job.findOne({channelId: channel});
	if (!job) return;

	await SiteCheckQueue.removeRepeatableByKey(job.repeatKey);
	await Job.deleteOne({channelId: channel});
	return;
}


function toggleJobForChannel(channel, enable) {
	switch(enable) {
		case true:
			return addJob(channel)
		default:
			removeJob(channel);
	}
}


async function sitesCheckProcessor(job) {
	const channel = await Channel.findOne({_id: job.data.channel});
	if (!channel) return;

	const settings = await Settings.get(job.data.channel);
	if (('enable' in settings) && JSON.parse(settings.enable)) {
		const response = await handleCheckSites(channel.sites);

		// webwatch.bot.client.channels.cache.get(channel.channelId).send(response);
	}
}


async function handleCheckSites(sites) {
	let statuses = await checkSites(sites);
	statuses = collectResults(statuses);
	await saveStatuses(statuses);
	return makeResponse(statuses);
}


function checkSites(sites) {
	return Promise.allSettled(
		sites.map(async site => {
			return checkSite(site);
		}
	));
}


function checkSite({url, _id}) {
	return new Promise((ok, not_ok) => {
		const timer = new utils.Timer();
		timer.start();

		superagent.get(url)
		.timeout(5000)
		.end((err, res) => {
			const responseTime = timer.elapse();
			if (err) {
				return not_ok({
					siteId: _id,
					url,
					responseTime,
					isOnline: false,
					status_code: err.statusCode,
					message: err.message
				});
			}
			if (res.statusCode >= 400) {
				return not_ok({
					siteId: _id,
					url,
					responseTime,
					isOnline: false,
					message: `RESPONSED WITH STATUS CODE ${res.statusCode}`,
					status_code: res.statusCode
				});
			}
			return ok({
				siteId: _id,
				url,
				responseTime,
				isOnline: true,
				status_code: res.statusCode
			});
		});
	});
}


function saveStatuses(site_statuses) {
	return Promise.all(
		site_statuses.map(async (status) => {
		return saveStatus(status);
	}));
}


async function saveStatus({siteId, url, message, responseTime, isOnline}) {
	let startDate = utils.formatDate({date: new Date()});
	let endDate = utils.formatDate({date: utils.addDays(startDate, 1)});

	let siteStatus = await SiteStatus.findOne({
		siteId,
		forDate: {
			$gt: startDate,
			$lt: endDate
		}
	});

	if(!siteStatus) {
		siteStatus = new SiteStatus({siteId});
	}
	siteStatus.statuses.push({
		isOnline,
		responseTime,
		reason: message
	});
	await siteStatus.save()
	return siteStatus;
}


function collectResults(statuses) {
	const fulfilled = statuses
		.filter(result => result.status === 'fulfilled')
		.map(result => result.value);
	const rejected = statuses
		.filter(result => result.status === 'rejected')
		.map(result => result.reason);
	return [...fulfilled, ...rejected];
}


function makeResponse(site_statuses) {
	let message = '';
	for(let site_status of site_statuses) {
		let {isOnline, url} = site_status;
		message += isOnline ? `:white_check_mark: <${url}>\n` : `:x: <${url}>\n`;
	}
	return message;
}


module.exports = {
	addJob,
	removeJob,
	toggleJobForChannel,
	sitesCheckProcessor,
	handleCheckSites
};
