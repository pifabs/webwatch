'use-strict';

const webwatch = require('../../index');
const mongoose = require('mongoose');


module.exports = class Database {
	constructor({host, port, database}) {
		this.host = host
		this.port = port
		this.database = database
		this.url = `mongodb://${this.host}:${this.port}/${this.database}`
	}

	connect() {
		mongoose.connect(this.url)
			.then(() => {
				console.log(`Connected to the database: ${this.url}`);
			})
			.catch(err=> {
				throw err;
			});
	}

	migrate() {
		for(let schema in webwatch.schemas) {
			webwatch.models[schema] = mongoose.model(
				schema,
				webwatch.schemas[schema]
			);
			console.log('Migrate: ', schema);
		}
	}

	debug(enable) {
		mongoose.set('debug', enable);
	}
}
