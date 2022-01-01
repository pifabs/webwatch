'use-strict';

const webwatch = require('../../index');
const { Settings } = webwatch.models;
const { CommandError } = webwatch.errors;


module.exports = {
	name: 'enable-alert',
	execute: async function({message, channel, args}) {
		if (!args || !args.length) {
			throw new CommandError(
				'Missing args\n Usage: w!enable-alert <1|0>'
			);
		}

		const filter = {
			channel: channel.id,
			key: 'alert'
		};
		const update = {
			...filter,
			value: args[0]
		};

		await Settings.findOneAndUpdate(filter, update, {
			new: true,
			upsert: true
		});
		message.reply('Saved!');
	}
};
