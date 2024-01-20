const Discord = require('discord.js');
const main = require('../index.js');
const db = main.db;

module.exports = {
	name: 'invite',
	description: 'Sends her invite link for users to invite her to their servers!',
	execute(message, args) {
		message.channel.send('https://discord.com/oauth2/authorize?client_id=781635291710095360&scope=bot&permissions=1879567472');
	},
};