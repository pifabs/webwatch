'use-strict';

module.exports = {
	Timer: class Timer {
		constructor() {
			this.startTime = null;
			this.endTime = null;
		}

		start() {
			this.startTime = new Date();
		}

		elapse() {
			this.endTime = new Date();
			return this.endTime - this.startTime;
		}
	}
}
