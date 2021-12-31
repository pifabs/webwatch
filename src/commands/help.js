'use-strict';

const { MessageEmbed } = require('discord.js');


module.exports = {
	name: 'help',
	execute: function({message, args}) {
		const help = new MessageEmbed()
			.setColor('#16ec50')
			.setTitle('WebWatch')
			.setDescription('Monitor websites without leaving discord')
			.setAuthor(
				'Created by pifabs',
				'https://avatars.githubusercontent.com/u/47163292?v=4', ''
			)
			.addFields(
				{ name: '\u200B', value: '\u200B' },
				{
					name: ':pencil: Add site to monitor',
					value: '!add-site <site1 site2 ...>',
					inline: true
				},
				{
					name: ':notepad_spiral: List sites you\'ve added',
					value: '!ls-sites',
					inline: true
				},
				{
					name: ':scissors: Remove site by index',
					value: '!rm-site <idx>',
					inline: true
				},
				{
					name: ':clock3: Schedule checks',
					value: '!sched-job <valid cron expression>',
					inline: true
				},
				{
					name: ':gear: ON\\OFF scheduled checks',
					value: '!enable-job <true|false>',
					inline: true
				},
				{
					name: 'Remove sceduled checks',
					value: '!rm-job',
					inline: true
				},
				{ name: '\u200B', value: '\u200B' },
				{
					name: ':stethoscope: Check your sites\' status',
					value: '!check-status',
					inline: true
				},
				{
					name: 'View site\'s stats',
					value: '!stats <idx1, idx2 ...>',
					inline: true
				},
				{ name: '\u200B', value: '\u200B' },
				{
					name: ':chart_with_downwards_trend: View charts',
					value: '!show-charts <idx>',
					inline: false
				}
			)
			.setTimestamp()
			message.reply({embeds: [help]});
	}
};
