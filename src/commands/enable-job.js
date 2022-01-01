'use-strict';

const webwatch = require('../../index');
const { CommandError } = webwatch.errors;
const { Settings } = webwatch.models;
const { toggleJobForChannel } = require('../jobs/monitoring');


module.exports = {
	name: 'enable-job',
	execute: async function({message, channel, args}) {
		if (!args || !args.length) {
			throw new CommandError(
				'Missing args\n Usage: !enable-job <true|false>'
			);
		}

		const filter = {
			channel: channel.id,
			key: 'enable'
		};

		const enable = +args[0];
		const update = {
			...filter,
			value: enable
		};
		await Settings.findOneAndUpdate(filter, update, {
			new: true,
			upsert: true
		});

		await toggleJobForChannel(channel.id, enable);
		message.reply('Saved!');
	}
};
