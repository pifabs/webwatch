'use-strict';


const { handleCheckSites } = require('../jobs/monitoring');


module.exports = {
	name: 'check-status',
	execute: async function({message, channel, args}) {
		message.reply(await handleCheckSites(channel.sites));
	}
};
