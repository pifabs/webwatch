'use-strict';

const path = require('path');

const nunjucks = require('nunjucks');
const webwatch = require('../../index');

const Database = require('../database/db');
const { Queue } = require('../jobs/scheduler');
const schemas = require('../schema');

const common = require('../common');
const errors = require('../errors');


module.exports = {
	start: async function (configs) {
		const {dbConfig, botConfig, redisConfig, emailConfig} = configs;
		this.init();
		await this.initDb(dbConfig);
		this.registerQueues(redisConfig);
		this.setupEmailer(emailConfig);
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
		SiteCheckQueue.registerProcessor(sitesCheckProcessor);
		SiteCheckQueue.registerListeners();
		webwatch.addQueue('SiteCheckQueue', SiteCheckQueue);
	},

	setupEmailer(emailConfig) {
		webwatch.emailer = webwatch.utils.emailer({
			host: emailConfig.EMAIL_HOST,
			port: emailConfig.EMAIL_PORT,
			secure: +emailConfig.EMAIL_SECURE,
			requireTLS: +emailConfig.EMAIL_REQUIRE_TLS,
			auth: {
			  user: emailConfig.EMAIL_AUTH_USER,
			  pass: emailConfig.EMAIL_AUTH_PWD,
			},
			tls: {
				ciphers: emailConfig.EMAIL_TLS_CIPHERS,
			},
		});

		nunjucks.configure(
			path.join(__dirname, '../templates'),
			{ autoescape: true }
		);
	}
};
