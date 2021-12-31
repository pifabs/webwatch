'use-strict';


const { Schema } = require('mongoose');


const siteSettings = new Schema({
	channel: {
		type: String,
		required: true
	},
	key: {
		type: String,
		required: true
	},
	value: {
		type: String,
		required: true
	}
});


siteSettings.statics.get = async function(channel) {
	const settings = await this.find({
		channel
	});

	const map = {};
	for (let setting of settings) {
		map[setting.key] = setting.value;
	}
	return map;
}

module.exports = siteSettings;
