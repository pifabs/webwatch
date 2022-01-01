'use-strict';

const { d3 } = require('d3-node');
const path = require('path');
const { MessageAttachment } = require('discord.js');
const sharp = require('sharp');

const webwatch = require('../../index');
const { SiteStatus } = webwatch.models;
const { CommandError } = webwatch.errors;
const utils = webwatch.utils;


module.exports = {
	name: 'show-charts',
	execute: async function({message, channel, args}) {
		if (!args || !args.length) {
			throw new CommandError('Missing args\n Usage: !show-charts <idx>');
		}

		const [idx] = [...new Set(args)];
		const site = await channel.sites[+idx];
		if (!site) return;

		let startDate = utils.formatDate({date: new Date()});
		let endDate = utils.formatDate({date: utils.addDays(startDate, 1)});

		const uptimeChart = await makeUptimeChart({
			site,
			startDate,
			endDate
		})
		const responseTimeChart = await makeResponseTimeChart({
			site,
			startDate,
			endDate
		});
		message.reply({
			content: `Uptime Chart for <${site.url}>`,
			files: [uptimeChart]
		});
		message.reply({
			content: `Resonse Time Chart for <${site.url}>`,
			files: [responseTimeChart]
		});
	}
};


async function makeUptimeChart({site, startDate, endDate}) {
	const siteId = site.id;

	let site_statuses = await SiteStatus
		.find({
			siteId,
			forDate: {
				$gt: startDate,
				$lt: endDate
			}
		})
		.sort({ forDate: 'asc'});

	if (!site_statuses.length) {
		throw new Error(`We have not collected any data for ${site.url}yet.`);
	}

	site_statuses = site_statuses
		.map(s => s.statuses)
		.reduce((a, b) => [...a, ...b]);

	const svgpath = path.join(
		__dirname,
		`../${new Date().toISOString()}-chart.svg`
	);
	const pngpath = path.join(
		__dirname,
		`../${new Date().toISOString()}-chart.png`
	);
	const uptimeChartDataSet = getUpTimeDataSet(site_statuses);

	const config1 = {
		data: uptimeChartDataSet,
		isCurve: false,
		margin: {top: 50, right: 50, bottom: 120, left: 70},
		rotateX: -60,
		xTickFormat: d3.timeFormat('%I:%M %p'),
		yTickFormat: (d)=> `${d}%`,
		title: `Uptime chart for ${site.url}`,
		xAxisTitle: d3.timeFormat('%B %d, %Y')(new Date()),
		yAxisTitle: '',
		svgpath,
		pngpath
	};
	return generateSVGChart(config1);
}

async function makeResponseTimeChart({site, startDate, endDate}) {
	const siteId = site.id;

	let site_statuses = await SiteStatus
		.find({
			siteId,
			forDate: {
				$gt: startDate,
				$lt: endDate
			}
		})
		.sort({ forDate: 'asc'});

	if (!site_statuses.length) {
		throw new Error(`We have not collected any data for ${site.url} yet.`);
	}

	site_statuses = site_statuses
		.map(s => s.statuses)
		.flat(2);

	const svgpath = path.join(
		__dirname,
		`../${new Date().toISOString()}-chart.svg`
	);
	const pngpath = path.join(
		__dirname,
		`../${new Date().toISOString()}-chart.png`
	);

	const responseTimeDataSet = getResponseTimeDataSet(site_statuses);
	const config = {
		data: responseTimeDataSet,
		isCurve: true,
		margin: {top: 50, right: 50, bottom: 120, left: 70},
		rotateX: -60,
		xTickFormat: d3.timeFormat('%I:%M %p'),
		title: `Response time chart for ${site.url}`,
		xAxisTitle: d3.timeFormat('%B %d, %Y')(new Date()),
		yAxisTitle: 'Response time in ms',
		svgpath,
		pngpath
	};
	return generateSVGChart(config);
}


function getUpTimeDataSet(data) {
	return data.map(datum => {
		return {
			key: datum.createdAt,
			value: +datum.isOnline*100
		};
	});
}


function getResponseTimeDataSet(data) {
	return data.map(datum => {
		return {
			key: datum.createdAt,
			value: datum.responseTime
		};
	});
}


async function generateSVGChart(options) {
	try {
		const svgString = utils.lineChart(options).svgString();

		const {svgpath, pngpath} = options;

		await utils.writeFileAsync(svgpath, svgString);

		const svg = await utils.readFileAsync(svgpath);
		const img = sharp(svg).flatten({ background: '#fff' });
		await img.toFile(pngpath);

		const image = await utils.readFileAsync(pngpath);

		await utils.rmAsync(svgpath);
		await utils.rmAsync(pngpath);
		return new MessageAttachment(image);
	  }
	catch (err) {
		console.error(err);
		throw err;
	  }
}
