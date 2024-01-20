const Discord = require('discord.js');
const main = require('../index.js');
const discordBot = main.discordBot;
var db = main.db;
const fs = require('fs'); 
let onlyNumbers = /([a-z A-Z])\w+/g

module.exports = {
	name: 'buy',
	description: 'Lets users buy items from the store',
	execute(message, args) {
		
		let amount = 1;

		const itemsJSON = JSON.parse(fs.readFileSync('items.jsonc'));

		// Lowercase, Remove numbers, and command
		const order = message.content.replace("!mona buy ", "").replace("!m buy ", "").toLowerCase().replace(/[0-9]/g, '');

		if (message.content.replace("!mona buy ", "").replace("!m buy ", "").replace( /^\D+/g, '') != 0) {
			amount = message.content.replace("!mona buy ", "").replace("!m buy ", "").replace( /^\D+/g, '');
			if (amount < 1 ) amount = 1; 
		}

		if (order == "you") return message.channel.send("M-Me?...");
		
		let orderedItem = ''; 

		const itemsEmbed = new Discord.MessageEmbed()
			.setAuthor('Mona Shop', 'https://cdn.discordapp.com/attachments/691139128267505664/784738431804375050/Adventurers_Guild.png', '')
			.setColor(`#dfb657`)
			.setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784750107815444510/General_Goods.png`)
			.setFooter(`Your new item has been added to your !mona inventory, make sure to use it!`);

		// If weapon they wrote exists in the weapons list then buy it
		if (itemsJSON.items.map(item => item.name.toLowerCase().includes(order)).includes(true)) {
			itemsJSON.items.forEach(item => {
				if (item.name.toLowerCase().startsWith(order)){
					orderedItem = item;
					itemsEmbed.setTitle(`You have bought ${amount} ${main.emoji(item.emoji)} \`${(item.name)}\` for ${main.emoji("784748211113033739")} \`${main.formatMoney(item.price * amount)}\``)
				}
			});

			if (orderedItem.name){
				// Get their current inventory
				db.query(`SELECT mora, inventory FROM users WHERE discordID = ${message.author.id}`, (error, results, fields) => {
					let inventory = results[0].inventory; 
					const mora = results[0].mora;
					
					// add items
					for (let i = 0; i < amount; i++) {
						inventory = JSON.stringify(main.inventoryHandler("add", orderedItem.name, inventory));
					}
					
					// Check if they have enough money
					if (mora < orderedItem.price * amount) {
						message.channel.send(`${message.author} You don't have enough Mora to afford this`)
						return
					}
					
					// Inform user they bought
					message.channel.send(message.author, itemsEmbed);
					
					// Submit to database		
					db.query(`UPDATE users SET inventory = '${inventory}', mora = mora - ${orderedItem.price * amount} WHERE discordID = ${message.author.id}`, (error, results, fields) => {
						console.database(`Updated user ${message.author.id.toString().blue}`);
					})
				}); 
			}
		} 
		// If weapon doesn't exist
		else {
			message.channel.send(`${message.author} I don't have that item! (did you type it correctly?)`);
		};				
	}
}