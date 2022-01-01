'use-strict';

const webwatch = require('../../index');
const { Settings } = webwatch.models;
const { CommandError } = webwatch.errors;


module.exports = {
	name: 'set-email',
	execute: async function({message, channel, args}) {
		if (!args || !args.length) {
			throw new CommandError(
				'Missing args\n Usage: w!set-email <valid email>'
			);
		}

		const filter = {
			channel: channel.id,
			key: 'email'
		};
		const update = {
			...filter,
			value: args.join(' ')
		};

		await Settings.findOneAndUpdate(filter, update, {
			new: true,
			upsert: true
		});
		message.reply('Saved!');
	}
};
