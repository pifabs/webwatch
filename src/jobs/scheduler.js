'use-strict';


const Queue = require('bull');


Queue.prototype.registerProcessor = function registerProcessor(count, fn) {
	this.process(count, function (job) {
		return fn(job);
	});
}


Queue.prototype.registerListeners = function() {
	this.on('completed', function (job, result) {
		console.log('Queue DONE: ', job.id, result);
	});

	this.on('error', function (error) {
		console.log('Queue ERR', error);
	});

	this.on('waiting', function (jobId) {
		console.log('Queue WAITING ', jobId);
	});

	this.on('active', function (job, jobPromise) {
		console.log('Queue ACTIVE ', job.id);
	});

	this.on('progress', function (job, progress) {
		console.log('Queue PROGRESS ', job.id);
	});

	this.on('failed', function (job, err) {
		console.log('Queue FAILED ', job.failedReason, err);
	});

	this.on('drained', function () {
		console.log('Queue EMPTY');
	});
}


module.exports = {Queue};
