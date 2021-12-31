'use-strict';


module.exports = {
	name: 'ls-reports',
	execute: async function({message, channel, args}) {
		const reports = [
			'Uptime report',
			'Response time report'
		];
		let msg = '';
		let idx= 0;
		for(let report of reports) {
			msg += `[${idx}] ${report}\n`;
			idx++;
		}
		msg += 'To view report: !view-report <idx>'
		message.channel.send(msg);
	}
};
