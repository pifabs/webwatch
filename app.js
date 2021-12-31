'use-strict';


const server = require('./src/server');

const {
	HTTP_PORT,
	DB_HOST,
	DB_PORT,
	DB_NAME,
	DB_DEBUG,
	TOKEN,
	REDIS_HOST,
	REDIS_PORT
} = process.env


server.start({
	httpConfig: {
		port: HTTP_PORT
	},
	dbConfig: {
		host: DB_HOST,
		port: DB_PORT,
		database: DB_NAME,
		debug: DB_DEBUG
	},
	redisConfig: {
		host: REDIS_HOST,
		port: REDIS_PORT,
	},
	botConfig: {
		token: TOKEN
	}
});
