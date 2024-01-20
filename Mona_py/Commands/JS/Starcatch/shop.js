const Discord = require('discord.js');
const main = require('../index.js');
const db = main.db;
const discordBot = main.discordBot;
const fs = require('fs'); 

// const starcatchChannelsJSON = main.starcatchChannelsJSON;

module.exports = {
	name: 'shop',
	description: 'Opens the shop and tells users the available commands to buy/sell things',
	execute(message, args) {
		console.command(`${"!mona shop".magenta} in ${(message.guild.name).toString().magenta}`)

		if(!args[0]) {
			const embed = new Discord.MessageEmbed()
			.setAuthor('Mona Shop', 'https://cdn.discordapp.com/attachments/691139128267505664/784738431804375050/Adventurers_Guild.png', '')
			.setColor(`#dfb657`)
			.setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784750107815444510/General_Goods.png`)
			.addFields(
				{ name: `Shops`, inline: true, value: [
				`${main.emoji("784758337304526868")} \`!mona shop swords\``,
				`${main.emoji("787758819718856714")} \`!mona shop polearms\``,
				`${main.emoji("789888059939749938")} \`!mona shop claymores\``,
				`${main.emoji("787013743904948294")} \`!mona shop potions\``,
				`${main.emoji("785856317830332416")} \`!mona shop food\``,
			]},
			)
			message.channel.send(embed);
		}

		let userMora = 0;

		db.query(`SELECT mora FROM users WHERE discordID = ${message.author.id}`, (error, results, fields) => {
			userMora = results[0].mora;

			// If !mona shop weapons -> Show all weapons available to buy
			if(args[0] == "swords") {
				const itemsJSON = JSON.parse(fs.readFileSync('items.jsonc'));
				const weaponsEmbed = new Discord.MessageEmbed()
					.setTitle(`Balance: ${main.emoji("784748211113033739")} ${main.formatMoney(userMora)}`)
					.setAuthor('Mona Shop', 'https://cdn.discordapp.com/attachments/691139128267505664/784738431804375050/Adventurers_Guild.png', '')
					.setColor(`#dfb657`)
					.setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784750107815444510/General_Goods.png`)
					.setFooter(`!mona buy (name of sword)`);
					
				let weaponNames = [];
				let weaponStats = [];

				itemsJSON.items.forEach(item => {
					if (item.category == "sword" && item.buyable == true) {
						weaponNames.push(`${main.emoji(item.emoji)} \`${(item.name)}\``);
						weaponStats.push(`\`${(item.damage)} ATK\` - ${(main.formatMoney(item.price))} ${main.emoji("784748211113033739")}`);
					}
				});

				weaponsEmbed.addField(`Swords:`, weaponNames, true);
				weaponsEmbed.addField(`Stats:`, weaponStats, true);
					
				message.channel.send(weaponsEmbed);
			}

			// If !mona shop weapons -> Show all weapons available to buy
			if(args[0] == "polearms") {
				const itemsJSON = JSON.parse(fs.readFileSync('items.jsonc'));
				const weaponsEmbed = new Discord.MessageEmbed()
					.setTitle(`Balance: ${main.emoji("784748211113033739")} ${main.formatMoney(userMora)}`)
					.setAuthor('Mona Shop', 'https://cdn.discordapp.com/attachments/691139128267505664/784738431804375050/Adventurers_Guild.png', '')
					.setColor(`#dfb657`)
					.setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784750107815444510/General_Goods.png`)
					.setFooter(`!mona buy (name of polearm)`);
					
				let weaponNames = [];
				let weaponStats = [];

				itemsJSON.items.forEach(item => { 
					if (item.category == "polearm" && item.buyable == true) {
						weaponNames.push(`${main.emoji(item.emoji)} \`${(item.name)}\``);
						weaponStats.push(`\`${(item.damage)} ATK\` - ${(main.formatMoney(item.price))} ${main.emoji("784748211113033739")}`);
					}
				});

				weaponsEmbed.addField(`Polearms:`, weaponNames, true);
				weaponsEmbed.addField(`Stats:`, weaponStats, true);
					
				message.channel.send(weaponsEmbed);  
			}


			// If !mona shop weapons -> Show all weapons available to buy
			if(args[0] == "claymores") {
				const itemsJSON = JSON.parse(fs.readFileSync('items.jsonc'));
				const weaponsEmbed = new Discord.MessageEmbed()
					.setTitle(`Balance: ${main.emoji("784748211113033739")} ${main.formatMoney(userMora)}`)
					.setAuthor('Mona Shop', 'https://cdn.discordapp.com/attachments/691139128267505664/784738431804375050/Adventurers_Guild.png', '')
					.setColor(`#dfb657`)
					.setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784750107815444510/General_Goods.png`)
					.setFooter(`!mona buy (name of claymore)`);
					
				let weaponNames = [];
				let weaponStats = [];

				itemsJSON.items.forEach(item => { 
					if (item.category == "claymore" && item.buyable == true) {
						weaponNames.push(`${main.emoji(item.emoji)} \`${(item.name)}\``);
						weaponStats.push(`\`${(item.damage)} ATK\` - ${(main.formatMoney(item.price))} ${main.emoji("784748211113033739")}`);
					}
				});

				weaponsEmbed.addField(`Claymores:`, weaponNames, true);
				weaponsEmbed.addField(`Stats:`, weaponStats, true);
					
				message.channel.send(weaponsEmbed);  
			}

			// If !mona shop food -> Show all foods available to buy
			if(args[0] == "food") {
				const itemsJSON = JSON.parse(fs.readFileSync('items.jsonc'));
				const foodsEmbed = new Discord.MessageEmbed()
					.setTitle(`Balance: ${main.emoji("784748211113033739")} ${main.formatMoney(userMora)}`)
					.setAuthor('Mona Shop', 'https://cdn.discordapp.com/attachments/691139128267505664/784738431804375050/Adventurers_Guild.png', '')
					.setColor(`#d74306`)
					.setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784750107815444510/General_Goods.png`)
					.setFooter(`!mona buy (name of dish)`);
					
				let foodNames = [];
				let foodStats = [];

				itemsJSON.items.forEach(item => {
					if (item.type == "food" && item.buyable == true) {
						foodNames.push(`${main.emoji(item.emoji)} \`${item.name}\``);
						foodStats.push(`\`${item.atk_percentage}% ATK for ${item.duration}sec\` - ${(main.formatMoney(item.price))} ${main.emoji("784748211113033739")}`);
					}
				});

				foodsEmbed.addField(`Dishes:`, foodNames, true);
				foodsEmbed.addField(`Stats:`, foodStats, true);
					
				message.channel.send(foodsEmbed);
			}

			// If !mona shop food -> Show all foods available to buy
			if(args[0] == "potions") {
				const itemsJSON = JSON.parse(fs.readFileSync('items.jsonc'));
				const embed = new Discord.MessageEmbed()
					.setTitle(`Balance: ${main.emoji("784748211113033739")} ${main.formatMoney(userMora)}`)
					.setAuthor('Mona Shop', 'https://cdn.discordapp.com/attachments/691139128267505664/784738431804375050/Adventurers_Guild.png', '')
					.setColor(`#ac19e5`)
					.setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784750107815444510/General_Goods.png`)
					.setFooter(`!mona buy (name of potion)`);
					
				let itemNames = []; 
				let itemStats = [];

				itemsJSON.items.forEach(item => {
					if (item.type == "potion" && item.buyable == true) {
						itemNames.push(`${main.emoji(item.emoji)} \`${item.name}\``);
						itemStats.push(`\`${item.atk_percentage}% ATK for ${item.duration}sec\` - ${(main.formatMoney(item.price))} ${main.emoji("784748211113033739")}`);
					}
				});

				embed.addField(`Potions:`, itemNames, true);
				embed.addField(`Stats:`, itemStats, true);
					
				message.channel.send(message.author, embed);
			}
		})

	},
};