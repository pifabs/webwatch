'use-strict';

const webwatch = require('../../index');
const { Job } = webwatch.models;
const {SiteCheckQueue} = webwatch.queues;


module.exports = {
	name: 'rm-job',
	execute: async function({message, channel, args}) {
		// SiteCheckQueue.obliterate({ force: true });
		const jobs = await Job.find({channelId: channel.id});
		if (!jobs.length) {
			return message.reply('No scheduled checks found.')
		};

		await Promise.all(jobs.map(async job => {
			await SiteCheckQueue.removeRepeatableByKey(job.repeatKey);
			await Job.deleteOne({channelId: channel.id});
		}));
		message.reply('Saved!');
	}
}
