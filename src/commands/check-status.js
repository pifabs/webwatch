'use-strict';


const { handleCheckSites, makeResponse } = require('../jobs/monitoring');


module.exports = {
	name: 'check-status',
	execute: async function({message, channel, args}) {
		const statuses = await handleCheckSites(channel.sites);
		message.reply(makeResponse(Object.values(statuses).flat(2)));
	}
};
