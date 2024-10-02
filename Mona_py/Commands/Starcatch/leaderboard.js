const Discord = require('discord.js');
const mysql = require('mysql');

const main = require('../index.js');
const db = main.db;

module.exports = {
	name: 'leaderboard',
	description: 'Leaderboard of all players!',
	execute(message, args) {
		console.command(`${"!mona leaderboard".magenta} in ${(message.guild.name).toString().magenta}`)

		db.query(`
			SELECT xp, discordID
			FROM users
			ORDER BY xp DESC
			LIMIT 20`, (error, results, fields) => {
				const embed = new Discord.MessageEmbed()
					.setTitle("Starcatch Global Leaderboard")
					.setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784687999119523850/starcatch.png`)
					.setColor('#4aa6f5');

				let array = [];

				results.forEach((object, index) => {
					array.push(`${index + 1}. - Lvl ${main.resolveLevel(object.xp)} - \`${object.xp} XP\` - <@${object.discordID}>`);
				});
				
				embed.addField(`Top 20 players:`, array, true)
				message.channel.send(embed);
		}); 
	},
};