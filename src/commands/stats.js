'use-strict';

const { MessageEmbed } = require('discord.js');

const webwatch = require('../../index');
const { Channel, SiteStatus } = webwatch.models;
const { CommandError } = webwatch.errors;


module.exports = {
	name: 'stats',
	execute: async function({message, args}) {
		if (!args || !args.length) {
			throw new CommandError(
				'Missing args\n Usage: !stats <idx1, idx2 ...>'
			);
		}
		let channel = await Channel.findOne({'channelId': message.channelId});
		const idxs = [... new Set(args)];
		const sites = channel.sites
			.filter((site, idx) => idxs.includes(`${idx}`));

		const dashBoardData = await getDashboardData(sites);
		const fields = makeFields(dashBoardData);

		const exampleEmbed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Dashboard')
			.addFields(...fields)
			.setTimestamp();

		message.reply({ embeds: [exampleEmbed] });
	}
}


function getDashboardData(sites) {
	return Promise.all(sites.map(async site => {
		const siteId = site.id;

		const latestStatus = await SiteStatus.getLatestStatus({ siteId });

		const responsetimeSMA = await SiteStatus.getResponsetimeSMA({
			siteId,
			sort: {
				'_id.createdAt': -1,
			},
			limit: 1
		});

		const healthSMA = await SiteStatus.getHealthSMA({
			siteId,
			sort: {
				'_id.createdAt': -1,
			},
			limit: 1
		});
		return {
			site,
			latestStatus: latestStatus[0],
			responsetimeSMA: responsetimeSMA[responsetimeSMA.length-1],
			healthSMA: healthSMA[healthSMA.length-1]
		}
	}));
}


function makeFields(dashBoardData) {
	console.log(dashBoardData);
	return dashBoardData.map(datum => {
		const { healthSMA, responsetimeSMA, latestStatus } = datum;
		const stats = [{
			name: datum.site.url,
			value: '\u200B',
			inline: false
		},
		{
			name: 'Health(current)',
			value: `${healthSMA ? healthSMA.health + '%' : '--'}`,
			inline: true
		},
		{
			name: 'Avg Health(30mins)',
			value: `${healthSMA ? healthSMA.sma30Mins.toFixed(2) + '%' : '--'}`,
			inline: true
		},
		{
			name: 'Avg Health(24hrs)',
			value: `${healthSMA ? healthSMA.sma24Hrs.toFixed(2) + '%' : '--'}`,
			inline: true
		},
		{
			name: 'Avg Health(30days)',
			value: `${healthSMA ? healthSMA.sma30Days.toFixed(2) + '%' : '--'}`,
			inline: true
		},
		{ name: '\u200B', value: '\u200B' },
		{
			name: 'Response Time(current)',
			value: `${responsetimeSMA ? responsetimeSMA.responseTime.toFixed(2) + ' ms' : '--'}`,
			inline: true
		},
		{
			name: 'Avg Response Time(30mins)',
			value: `${responsetimeSMA ? responsetimeSMA.sma30Mins.toFixed(2) + ' ms' : '--'}`,
			inline: true
		},
		{
			name: 'Avg Response Time(24hrs)',
			value: `${responsetimeSMA ? responsetimeSMA.sma24Hrs.toFixed(2) + ' ms' : '--'}`,
			inline: true
		},
		{
			name: 'Avg Response Time(30days)',
			value: `${responsetimeSMA ? responsetimeSMA.sma30Days.toFixed(2) + ' ms' : '--'}`,
			inline: true
		}
		];

		if (latestStatus && !latestStatus.isOnline) {
			stats.push(
				{
					name: 'Last downtime reason',
					value: `${datum.latestStatus.reason}`,
					inline: false
				}
			)
		}

		return stats;
	})
		.flat(2);
}
