'use-strict';


module.exports = {
	initializeAndRegister(customModels = {}, force = false) {
		this.init(force);
		const common = require('./src/common');
		this.registerLibs(common);
		const coreModels = require('./src/models');
		this.registerModels(coreModels);
		this.registerModels(customModels);
	},

	init(force) {
		if (this._initialized && !force) return;
		this.initGlobals();
		this._initialized = true;
	},

	initGlobals() {
		this.errors = {};
		this.models = {};
		this.schemas = {};
		this.queues = {};
		this.processors = {};
	},

	registerModels(schemas) {
		for(let schema in schemas) {
			this.schemas[schema] = schemas[schema];
			console.log('Register Model: ', schema);
		}
	},

	registerErrors(errors) {
		for(let err in errors) {
			this.errors[err] = errors[err];
		}
	},

	registerLibs(common) {
		common.initLibs(this);
	},

	addQueue(name, queue) {
		this.queues[name] = queue;
	},

	addQueueProcessor(queue, processor) {
		this.processors[queue] = processor;
	}
};
