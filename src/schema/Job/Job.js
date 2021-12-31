'use-strict';


const { Schema } = require('mongoose');

const jobSchema = new Schema({
	channelId: {
		type: String,
		required: true
	},
	repeatKey: {
		type: String,
		required: true
	}
});


module.exports = jobSchema;
