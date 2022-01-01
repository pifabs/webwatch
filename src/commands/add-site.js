'use-strict';

const webwatch = require('../../index');
const { CommandError } = webwatch.errors;
const utils = webwatch.utils;


module.exports = {
	name: 'add-site',
	execute: async function({message, channel, args}) {
		if (!args || !args.length) {
			throw new CommandError(
				'Missing args\n Usage: !add-site <url1 url2 ...>'
			);
		}

		let urls = [... new Set(args)];

		if (!await validateUrls(urls)) {
			throw new CommandError('Invalid url(s)');
		}

		urls = await utils.getOrigins(urls)
			.filter(url => !channel.findSiteByUrl(url))
			.map(url => {
				return {url};
			});

		if (urls.length) {
			await channel.addSites(urls).save();
			message.channel.send('New site(s) successfully added.');
		}
	}
};


function validateUrls(urls) {
	return Promise.all(urls.map(url => {
		return utils.isValidURL(url);
	})).catch(err => {
		return false;
	});
}
