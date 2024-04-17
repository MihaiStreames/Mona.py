const Discord = require('discord.js');

const main = require('../index.js');
const db = main.db;
const voicelinesJSON = main.voicelinesJSON;

module.exports = {
	name: 'friends',
	description: 'What mona thinks about her friends',
	execute(message, args) {
		console.command(`${"!mona friends".magenta} in ${(message.guild.name).toString().magenta}`)
		if(!args[0]) return message.channel.send("do !mona friends (name of genshin character)");
		if (!voicelinesJSON["friends"][args[0]]) return message.channel.send("Who is that? I—I don't think I ever met them before...")
		message.channel.send(voicelinesJSON["friends"][args[0]]); 
	},
};