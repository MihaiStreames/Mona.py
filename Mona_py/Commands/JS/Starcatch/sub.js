const Discord = require('discord.js');
const main = require('../index.js');
const db = main.db;

module.exports = {
	name: 'sub',
	description: 'Assigns users to the Adventurer\'s Guild command so they get notified when new bosses drop!',
	async execute(message, args) {
		console.command(`${"!mona sub".magenta} in ${(message.guild.name).toString().magenta}`)
		let role = message.guild.roles.cache.find(r => r.name === "🌠 Adventurer's Guild");
		if(!role) return message.channel.send(`${message.author} Theres no 🌠 Adventurer's Guild role, please do !mona starcatch setup to create one`);
		
		try {
			await message.member.roles.add(role);
		} catch (error) {
			if (error) return message.channel.send(`${message.author} I don't have permissions to assign roles!`);
		}
		message.channel.send(`Added you in the Adventurer's Guild! \`!mona unsub\` to resign`);
	},
};