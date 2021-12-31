'use-strict';

const fs = require('fs');
const path = require('path');

const { Client, Intents, Collection } = require('discord.js');

const webwatch = require('../index');
const {Channel } = webwatch.models;

const prefix = 'w!';


class Bot {
	constructor(token) {
		this.token = token;
		this.client = new Client({
			intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
		});
	}

	init() {
		this.initCommands();
		this.setUpListeners();
		this.client.login(this.token);

	}

	initCommands() {
		this.client.commands = new Collection();
		const commandFiles = fs.readdirSync(
			path
			.join(__dirname, './commands'))
			.filter(file => file.endsWith('.js')
		);

		for (const file of commandFiles) {
			const command = require(`./commands/${file}`);
			this.client.commands.set(command.name, command);
		}
	}

	setUpListeners() {
		this.client.on('ready', () => {
			console.log(`Logged in as ${this.client.user.tag}!`)
		});

		this.client.on('message', async (message) => {
			let channel = await Channel.findOne({'channelId': message.channelId});
			if(!channel) {
				channel = new Channel({'channelId': message.channelId})
				channel = await channel.save();
			}

			if(message.author.bot) return;
			if(!message.content.startsWith(prefix)) return;

			const {command, args} = this.getCommandAndArgs(message);

			try {
				const cmd = this.client.commands.get(command);
				if (!cmd) return;

				let channel = await Channel.findOne({
					'channelId': message.channelId
				});
				if (!channel) return

				await cmd.execute({message, channel, args});
			} catch (err) {
				console.error(err);
				message.reply(err.message);
			}
		});
	}

	getCommandAndArgs(message) {
		const commandBody = message.content.slice(prefix.length);
		const args = commandBody.split(' ');
		const command = args.shift().toLowerCase();
		return { command, args };
	}
}


module.exports = {Bot};
