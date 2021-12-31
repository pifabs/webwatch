'use-strict';


module.exports = {
	name: 'ls-sites',
	execute: async function({message, channel, args}) {
		const sites = channel.sites;
		let msg = '';
		let idx = 0;
		for(let site of sites) {
			msg += `[${idx}] <${site.url}>\n`;
			idx++;
		}
		message.channel.send(msg);
	}
};
