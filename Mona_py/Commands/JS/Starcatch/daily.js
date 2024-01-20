const Discord = require('discord.js');
const main = require('../index.js');
const db = main.db;
const fs = require('fs'); 
const itemsJSON = JSON.parse(fs.readFileSync('items.jsonc'));
function msToTime(duration) {
	var milliseconds = parseInt((duration % 1000) / 100),
	  	minutes = Math.floor((duration / (1000 * 60)) % 60),
	  	hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
  
	return hours + ":" + minutes;
}

module.exports = {
	name: 'daily',
	description: 'Daily rewards',
	execute(message, args) {
        console.command(`${"!mona daily".magenta} in ${(message.guild.name).toString().magenta}`);
		
		db.query(`SELECT daily, inventory, mora FROM users WHERE discordID = ${message.author.id}`, (error, results, fields) => {
			if (error) return console.log(error);

			let dailyStatus = JSON.parse(results[0].daily);
			let inventory = results[0].inventory;
			let mora = results[0].mora;
			
			// Initialize daily if they don't alread have it (legacy)
			if (dailyStatus == null) {
				dailyStatus = {
					claimedDate: 0,
					streak: 0,
				};
			}

			// If its been longer than 24 hours from the last claim and less than the next day then add to the streak
			if (new Date().getTime() > (dailyStatus.claimedDate + 86400000) && new Date().getTime() < (dailyStatus.claimedDate + 172800000)) {
				dailyStatus.claimedDate = new Date().getTime();
				dailyStatus.streak = dailyStatus.streak + 1;
				console.log("new claim");
			} 
			// if its been longer than 24 hours just reset their streak
			else if (new Date().getTime() > (dailyStatus.claimedDate + 86400000)) {
				dailyStatus.claimedDate = new Date().getTime();
				dailyStatus.streak = 1;
			}
			else {
				return message.channel.send(`${message.author} You already claimed today, try again in **${msToTime(dailyStatus.claimedDate + 86400000 - new Date().getTime())}h**`);
			}

			let possibleFoods = [];
			let possibleIngredients = [];

			// Get all Foods and add them to the possible rewards
			itemsJSON.items.forEach(item => {
				if (item.type == "food") { 
					possibleFoods.push(item.name);
				}
				if (item.type == "ingredient") {
					possibleIngredients.push(item.name);
				}
			});

			let randomFood = main.randomItem(possibleFoods);
			let randomIngredient = main.randomItem(possibleIngredients);

			let foodAmount = 2 + Math.floor(Math.random() * 1) + dailyStatus.streak;
			let ingredientAmount = 2 + Math.floor(Math.random() * 2) + dailyStatus.streak;

			// Add Foods
			for (let i = 0; i < foodAmount; i++) {
				inventory = JSON.stringify(main.inventoryHandler("add", randomFood, inventory)); 
			}

			// Add Ingredients
			for (let i = 0; i < ingredientAmount; i++) {
				inventory = JSON.stringify(main.inventoryHandler("add", randomIngredient, inventory));
			}

			const randomMora = 4250 + Math.floor(Math.random() * 750) + dailyStatus.streak * 1000;

			const embed = new Discord.MessageEmbed()
				.setAuthor('Mona Daily', 'https://cdn.discordapp.com/attachments/691139128267505664/784738431804375050/Adventurers_Guild.png', '')
				.setColor(`#d74306`)
				.setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784750107815444510/General_Goods.png`)
				.setTitle(`Here's your rewards`)
				.setFooter(`${dailyStatus.streak}x Daily Streak || Don't forget to do !mona vote for more rewards!`)
				.addFields(
					{ name: `Mora`, inline: true, value: [`${main.emoji("784748211113033739")} \`${main.formatMoney(randomMora)}\``]},
					{ name: `Food`, inline: true, value: `${main.emoji(main.getItemByName(randomFood).emoji)} ${randomFood} x${foodAmount}`},
					{ name: `Ingredients`, inline: true, value: `${main.emoji(main.getItemByName(randomIngredient).emoji)} ${randomIngredient} x${ingredientAmount}`},
				);  

			db.query(`UPDATE users SET 
				daily = '${JSON.stringify(dailyStatus)}', 
				inventory = '${inventory}',
				mora = mora + ${randomMora}
				WHERE discordID = ${message.author.id}`, (error, results, fields) => {
					if (error) return console.log(error);
					message.channel.send(message.author, embed); 
			});
		});
	}
}