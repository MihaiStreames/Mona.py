const Discord = require('discord.js');
const main = require('../index.js');
const discordBot = main.discordBot;
var db = main.db;

module.exports = {
	name: 'stats',
	description: 'Shows a user\'s statistics',
	execute(message, args) {
		console.command(`${"!mona stats".magenta} in ${(message.guild.name).toString().magenta}`);
		let user = message.author.id;
		let title = "Your Stats"; 
	
		// if user wants to check someone else's xp
		if (message.mentions.users.first()) {  
		  user = message.mentions.users.first().id; 
		  title = `${message.mentions.users.first().username}'s Stats`;
		}
			
			db.query(`SELECT xp, comets, stars, equipped_weapon, meteorites, buffs FROM users WHERE discordID = ${user}`, (error, results, fields) => {

			// Calculate user's Buffs
			let equippedWeapon = main.getItemByName(results[0].equipped_weapon);
			equippedWeapon.damage = parseInt(equippedWeapon.damage);
			let atkMultipler = 0;

			let buffs = JSON.parse(results[0].buffs);

			// Go through every type of buff (ATK, CRIT_DMG etc) 
			for (const [buffType, buffList] of Object.entries(buffs)) {
				// Add up ATK
				buffList.forEach((buff, index) => {
					if (buff.until > new Date().getTime()) {
						atkMultipler += buff.atk_percentage * buff.amount
					}
					else {
						buffs[buffType].splice(index, 1);
						db.query(`UPDATE users SET buffs = '${JSON.stringify(buffs)}' WHERE discordID = ${user}`, (error, results, fields) => {
							console.database(`Updated user ${message.author.id.toString().blue}`);
						});
					};
				})
			}

			let atk = (parseInt(equippedWeapon.damage) + (parseInt(equippedWeapon.damage) * (parseInt(atkMultipler) / 100)) + (main.resolveLevel(results[0].xp) * 4))

			// Construct embed
			const embed = new Discord.MessageEmbed()
				.setTitle(title)
				.setDescription(`Here's your statistics!`)
				.addFields(
				//   { name: `Comets:`, inline: true, value: `${main.emoji("784784685401767946")} \`${results[0].comets}\``},
				//   { name: `Stars:`, inline: true, value: `${main.emoji("784784685783449640")} \`${results[0].stars}\``},
				//   { name: `Meteorites:`, inline: true, value: `${main.emoji("784784685766017064")} \`${results[0].meteorites}\``},
					{ name: `Total XP:`, inline: true, value: `${main.emoji("784822494469160992")} \`${results[0].xp}\``},
					{ name: `Level:`, inline: true, value: `${main.emoji("784822477561790484")} \`${main.resolveLevel(results[0].xp)}\``},
					{ name: `ATK:`, inline: true, value: `${main.emoji("786036468891779092")} \`${parseInt(atk).toFixed(0)} (${main.resolveLevel(results[0].xp) * 4} from levels ${parseInt(equippedWeapon.damage * (atkMultipler / 100)).toFixed(0)} from buffs)\``},
				)
				
				.setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784687999119523850/starcatch.png`)
				.setColor('#4aa6f5');
	
		  	message.channel.send(message.author, embed);
		}) 
	},
};