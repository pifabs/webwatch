'use-strict';

var parser = require('cron-parser');
const { toggleJobForChannel } = require('../jobs/monitoring');
const webwatch = require('../../index');
const { Settings } = webwatch.models;
const { CommandError } = webwatch.errors;

module.exports = {
	name: 'sched-job',
	execute: async function({message, channel, args}) {
		if (!args || !args.length) {
			throw new CommandError(
				'Missing args\n Usage: !sched-job <valid cron expression>'
			);
		}

		try {
			parser.parseExpression(args.join(' '));
		} catch (err) {
			throw new CommandError('Invalid cron expression.');
		}

		const filter = {
			channel: channel.id,
			key: 'schedule'
		};
		const update = {
			...filter,
			value: args.join(' ')
		};

		await Settings.findOneAndUpdate(filter, update, {
			new: true,
			upsert: true
		});
		await toggleJobForChannel(channel.id, false);
		await toggleJobForChannel(channel.id, true);
		message.reply('Saved!');
	}
};
