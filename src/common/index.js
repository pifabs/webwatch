'use-strict';


const date = require('./date');
const lineChart = require('./chart');
const file = require('./file');
const url = require('./url');
const Timer = require('./timer');


module.exports = {
	initLibs(webwatch) {
		webwatch.utils = {};
		Object.assign(webwatch.utils, date);
		Object.assign(webwatch.utils, lineChart);
		Object.assign(webwatch.utils, file);
		Object.assign(webwatch.utils, url);
		Object.assign(webwatch.utils, Timer);
		console.log('initLibs');
	}
}
