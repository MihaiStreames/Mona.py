const Discord = require('discord.js');
const main = require('../index.js');
const discordBot = main.discordBot;
var db = main.db;
const fs = require('fs'); 



module.exports = {
	name: 'sell',
	description: 'Lets users sell their items',
	execute(message, args) {
		const order = message.content.toLowerCase().replace("!mona sell ", "").replace("!m sell ", "");

		if (order === "stars") {
			db.query(`SELECT mora, comets, stars, meteorites FROM users WHERE discordID = ${message.author.id}`, (error, results, fields) => {
				const mora = results[0].mora;
				let comets = results[0].comets;
				let stars = results[0].stars;
				let meteorites = results[0].meteorites;


				let totalPrice = comets*265*2 + stars*640*2 + meteorites*1275*2

				const soldEmbed = new Discord.MessageEmbed()
					.setAuthor('Mona Shop', 'https://cdn.discordapp.com/attachments/691139128267505664/784738431804375050/Adventurers_Guild.png', '')
					.setColor(`#dfb657`)
					.setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784750107815444510/General_Goods.png`)
					.setTitle(`You've sold all your stars for! ${main.emoji("784748211113033739")} \`${main.formatMoney(totalPrice)} Mora!\``)
					.addFields(
						{ name: `Stars`, inline: true, value: [
							`${main.emoji("784784685401767946")} \`x${comets}\` for: ${main.emoji("784748211113033739")} \`${main.formatMoney(comets*265*2)} Mora (${main.formatMoney(265*2)} each)\``,
							`${main.emoji("784784685783449640")} \`x${stars}\` for: ${main.emoji("784748211113033739")} \`${main.formatMoney(stars*640*2)} Mora (${main.formatMoney(640*2)} each)\``,
							`${main.emoji("784784685766017064")} \`x${meteorites}\` for: ${main.emoji("784748211113033739")} \`${main.formatMoney(meteorites*1275*2)} Mora (${main.formatMoney(1275*2)} each)\``,
						]},
					)

				// Inform user they bought
				message.channel.send(message.author, soldEmbed);

				// Submit to database		
				db.query(`UPDATE users SET comets = 0, stars = 0, meteorites = 0, mora = mora + ${totalPrice} WHERE discordID = ${message.author.id}`, (error, results, fields) => {
					console.database(`Updated user ${message.author.id.toString().blue}`);
				})
			}); 
		}
	},
};