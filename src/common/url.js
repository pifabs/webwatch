'use-strict';


const dns = require('dns');
const { URL} = require('url');


function isValidURL(urlString) {
	return new Promise((ok, notOk) => {
		try {
			const urlObj = new URL(urlString);
			dns.lookup(urlObj.protocol ? urlObj.host : urlObj.path, (err,address,family) => {
				if (err) return notOk(err);
				return ok(true);
			});
		}
		catch (err) {
			return notOk(err);
		}
	});
}

function getOrigins(urlStrings) {
	return urlStrings.map(urlString => {
		return new URL(urlString).origin;
	});
}


module.exports = {
	isValidURL,
	getOrigins
}
