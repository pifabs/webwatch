'use-strict';

const webwatch = require('../../index');
const { CommandError } = webwatch.errors;


module.exports = {
	name: 'rm-site',
	execute: async function({message, channel, args}) {
		if (!args || !args.length) {
			throw new CommandError('Missing args\n Usage: !rm-site url');
		}

		const idx = [... new Set(args)][0];
		const site = channel.sites[idx];
		await channel.removeSiteByIndex(+idx);
		await channel.save();
		message.channel.send(`<${site.url}> successfully removed.`);
	}
}
