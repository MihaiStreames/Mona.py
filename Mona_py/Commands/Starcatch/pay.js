const Discord = require('discord.js');
const main = require('../index.js');
const discordBot = main.discordBot;
var db = main.db;
const fs = require('fs'); 

// HAHA fuck you i coded this really well (lol not really the fucking db queries are horrible) but FUCK YOU HA 🔥🔥🔥🔥🔥🔥

module.exports = {
	name: 'pay',
	description: 'Lets users pay other users', 
	async execute(message, args) {
        console.command(`${"!mona pay".magenta} in ${(message.guild.name).toString().magenta}`)
		
		// remove spaces from args
		args = args.filter(arg => arg != "");

		let payeeBalance = 0; // 2400 Mora 
		let recipientBalance = 0; // 2400 Mora
		let transactionAmount = Math.floor(parseInt(args[1])); // Floor it to avoid float numbers

		if (!args[0] || !message.mentions.users.first()) return message.channel.send(`${message.author} please tag the user you want to pay!`);
		if (!args[1]) return message.channel.send(`${message.author} please specify the amount of Mora you want to pay!`);
		if (message.mentions.users.first().bot) return message.channel.send(`${message.author} you can not pay Bots!`);
		if (message.author.id == message.mentions.users.first().id) return message.channel.send(`${message.author} you can not pay yourself!`);
		if (transactionAmount < 0) return message.channel.send(`${message.author} you can't give negative Mora!`);
		if (isNaN(transactionAmount)) return message.channel.send(`${message.author} please specify a proper number of Mora!`);

		// Get payee's balance
		db.query(`SELECT mora FROM users WHERE discordID = ${message.author.id}`, (error, results, fields) => {
			payeeBalance = parseInt(results[0].mora);

			// Get recipient's balance
			db.query(`SELECT mora FROM users WHERE discordID = ${message.mentions.users.first().id}`, (error, results, fields) => {
				recipientBalance = parseInt(results[0].mora);  

				// if payee is trying to pay more than they have inform them
				if (payeeBalance < transactionAmount) return message.channel.send(`${message.author} You don't have enough Mora for this transaction`)

				db.query(`UPDATE users SET mora = mora - ${transactionAmount} WHERE discordID = ${message.author.id}`, (error, results, fields) => {
					console.database(`Updated user ${message.author.id.toString().blue}`); 
				})

				db.query(`UPDATE users SET mora = mora + ${transactionAmount} WHERE discordID = ${message.mentions.users.first().id}`, (error, results, fields) => {
					console.database(`Updated user ${message.author.id.toString().blue}`);
					
					const embed = new Discord.MessageEmbed()
						.setAuthor('Mona Trade', 'https://cdn.discordapp.com/attachments/691139128267505664/784738431804375050/Adventurers_Guild.png', '')
						.setColor(`#7CFC00`)
						.setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784750107815444510/General_Goods.png`)
						.setTitle(`Transaction Successfull!`)
						.addFields(
							{ name: `Info`, inline: true, value: [
								`You paid ${message.mentions.users.first()} ${main.emoji("784748211113033739")} \`${main.formatMoney(transactionAmount)} Mora!\``,
							]},
						)

					// Inform user they paid
					message.channel.send(message.author, embed);
				})
			});
		});
	},
};