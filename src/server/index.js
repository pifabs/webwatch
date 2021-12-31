'use-strict';

const webwatch = require('../../index');

const Database = require('../database/db');
const { Queue } = require('../jobs/scheduler');
const schemas = require('../schema');

const common = require('../common');
const errors = require('../errors');


module.exports = {
	start: async function ({dbConfig, botConfig, redisConfig}) {
		this.init();
		await this.initDb(dbConfig);
		this.registerQueues(redisConfig);
		await this.initBot(botConfig);
	},

	async init() {
		webwatch.init();
		webwatch.registerErrors(errors);
		webwatch.registerLibs(common);
		webwatch.registerModels(schemas, 'server');
	},

	async initDb(dbConfig) {
		webwatch.db = new Database(dbConfig);
		webwatch.db.debug(dbConfig.debug);

		await webwatch.db.connect();
		webwatch.db.migrate();
	},

	async initBot(botConfig) {
		const { Bot } = require('../bot');
		const bot = new Bot(botConfig.token);
		bot.init();
		webwatch.bot = bot;
	},

	registerQueues(redisConfig) {
		const SiteCheckQueue = new Queue('SiteCheckQueue', {
			redis: redisConfig
		});

		const { sitesCheckProcessor } = require('../jobs/monitoring');
		SiteCheckQueue.registerProcessor(5, sitesCheckProcessor);
		SiteCheckQueue.registerListeners();
		webwatch.addQueue('SiteCheckQueue', SiteCheckQueue);
	}
};
