const Discord = require('discord.js');
const main = require('../index.js');
const discordBot = main.discordBot;
var db = main.db;
const fs = require('fs'); 
const itemsJSON = JSON.parse(fs.readFileSync('items.jsonc'));


module.exports = {
	name: 'use',
	description: 'Lets a user use an item from their inventory',
	execute(message, args) {

		let amount = 1;

		console.command(`${"!mona use".magenta} in ${(message.guild.name).toString().magenta}`);
		let user = message.author.id;

		// Lowercase, Remove numbers, and command
		let itemToUse = message.content.toLowerCase().replace("!mona use ", "").replace("!m use ", "").replace(/[0-9]/g, '');
	
		if (message.content.replace("!mona use ", "").replace("!m use ", "").replace( /^\D+/g, '') != 0) {
			amount = message.content.replace("!mona use ", "").replace("!m use ", "").replace( /^\D+/g, '');
			if (amount < 1 ) amount = 1;
		}

		db.query(`SELECT inventory, buffs FROM users WHERE discordID = ${user}`, (error, results, fields) => {
			console.database(`Fetching user ${message.author.tag.toString().blue}`);

			let inventory = results[0].inventory;
			let buffs = JSON.parse(results[0].buffs);

			let exists = false;

			let parsedInventory = [];
			// Check all their items and see if they have more than 0 of that item, if so add it on the list of parsedInventory items they have
			for (const [item, value] of Object.entries(JSON.parse(inventory))) {
				if (value >= amount) {
					parsedInventory.push(item.toLowerCase());
				}
			}

			// if they don't have the item in their inventory throw an error
			for (item of parsedInventory) {
				if (item.startsWith(itemToUse)) {
					exists = true;
				} 
			}

			// if it doesn't exist in their inventory tell them so
			if (!exists) return message.channel.send(`${message.author} You don't have that item! (did you type it correctly?)`);

			if (itemsJSON.items.map(item => item.name.toLowerCase().includes(itemToUse)).includes(true)) {
				itemsJSON.items.forEach(item => {
					if (item.name.toLowerCase().startsWith(itemToUse)){
						itemToUse = item;
					}
				});

				// if item isnt a consumable 
				if (!itemToUse.consumable) return message.channel.send(`You can't consume a ${itemToUse.name}! Can you?`);

				// If the buff type (e.g. ATK/CRIT RATE) doesn't existing add it
				if (!buffs[itemToUse.buff]) buffs[itemToUse.buff] = [];


				for (let i = 0; i < amount; i++) {
					inventory = JSON.stringify(main.inventoryHandler("remove", itemToUse.name, inventory));
				}

				// Add buff
				buffs[itemToUse.buff].push({
					name: itemToUse.name,
					atk_percentage: itemToUse.atk_percentage,
					until: new Date().getTime() + itemToUse.duration * 1000,
					amount: amount
				});

				// Inform user they used
				const embed = new Discord.MessageEmbed()
					.setTitle(`You consumed ${amount}x ${itemToUse.name}!`)
					.setThumbnail(`${itemToUse.icon}`)
					.addField(`Buff:`, `+${itemToUse.atk_percentage * amount}% ${itemToUse.buff}`, true)
					.addField(`Duration:`, `${itemToUse.duration} seconds`, true)
					.setColor('#4aa6f5');
					

				message.channel.send(message.author, embed); 

				// Submit to database		
				db.query(`UPDATE users SET inventory = '${inventory}', buffs = '${JSON.stringify(buffs)}' WHERE discordID = ${message.author.id}`, (error, results, fields) => {
					console.database(`Updated user ${message.author.id.toString().blue}`);
				})
			}
		}) 
	},
};