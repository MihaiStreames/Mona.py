const Discord = require('discord.js');
const main = require('../index.js');
const discordBot = main.discordBot;
var db = main.db;
const fs = require('fs'); 
const itemsJSON = JSON.parse(fs.readFileSync('items.jsonc'));


module.exports = {
	name: 'equip',
	description: 'Lets a user equip a weapon',
	execute(message, args) {
        console.command(`${"!mona equip".magenta} in ${(message.guild.name).toString().magenta}`)

		let weaponToEquip = message.content.toLowerCase().replace("!mona equip ", "").replace("!m equip ", "");
		
		db.query(`SELECT equipped_weapon, inventory FROM users WHERE discordID = ${message.author.id}`, (error, results, fields) => {
			let inventory = results[0].inventory;
			let equippedWeapon = results[0].equipped_weapon;
			let exists = false;

			// Gives us their items that arent 0
			let parsedInventory = [];
			for (const [item, value] of Object.entries(JSON.parse(inventory))) {
				if (value != 0) {
					parsedInventory.push(item.toLowerCase());
				}
			}

			// if they don't have the item in their inventory throw an error
			for (item of parsedInventory) {
				if (item.toLowerCase() == weaponToEquip.toLowerCase()) {
					exists = true;
				}
			}

			// if it doesn't exist in their inventory tell them so
			if (!exists) return message.channel.send(`${message.author} You don't have that item! (did you type the entire name?)`);

			// otherwise find if the item exists in the items list
			if (itemsJSON.items.map(item => item.name.toLowerCase().includes(weaponToEquip)).includes(true)) {
				itemsJSON.items.forEach(item => {
					if (item.name.toLowerCase().startsWith(weaponToEquip)){
						weaponToEquip = item;
					}
				});

				// console.log(weaponToEquip);
				if (weaponToEquip.type == "material" || weaponToEquip.type == "food" || weaponToEquip.type == "potion") return message.channel.send(`${message.author} you can't equip this item!`);
				// Swap equipped with inventory weapon
				inventory = JSON.stringify(main.inventoryHandler("remove", weaponToEquip.name, inventory));
				inventory = JSON.stringify(main.inventoryHandler("add", equippedWeapon, inventory));

				const embed = new Discord.MessageEmbed() 
					.setAuthor(`${message.author.username}'s Inventory`, 'https://cdn.discordapp.com/attachments/784680433043767346/784838975238963240/bag.png', '')
					.setColor(`#c3edff`)
					.addFields( 
						{ name: `Equipped`, inline: true, value: `${main.emoji(weaponToEquip.emoji)} ${weaponToEquip.name}`},
						{ name: `⠀`, inline: true, value: '⇌'},
						{ name: `Unequipped`, inline: true, value: `${main.emoji(main.getItemByName(equippedWeapon).emoji)} ${main.getItemByName(equippedWeapon).name}`},
					)

				// Inform user they swapped
				message.channel.send(message.author, embed);

				// Submit to database		
				db.query(`UPDATE users SET inventory = '${inventory}', equipped_weapon = '${weaponToEquip.name}' WHERE discordID = ${message.author.id}`, (error, results, fields) => {
					console.database(`Updated user ${message.author.id.toString().blue}`);
				})
			}
		});
	},
};