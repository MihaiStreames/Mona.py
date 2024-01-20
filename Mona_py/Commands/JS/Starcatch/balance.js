const Discord = require('discord.js');
const main = require('../index.js');
const db = main.db;
const discordBot = main.discordBot;
const fs = require('fs');

module.exports = {
    name: 'balance',
    description: "Shows you your current balance",
	execute(message, args) {
        db.query(`SELECT mora FROM users WHERE discordID = ${message.author.id}`, (error, results, fields) => {
            console.database(`Fetching user ${message.author.tag.toString().blue}`);
            const embed = new Discord.MessageEmbed() 
                .setAuthor(`${message.author.username}'s Balance`, 'https://cdn.discordapp.com/emojis/784748211113033739.png', '')
                .setColor(`#dec266`)
                .addFields({ name: `Mora`, inline: true, value: [`\`${main.formatMoney(results[0].mora)}\``]});
            
            try { message.channel.send(message.author, embed); }
            catch (error) { if (error) return message.channel.send(`${message.author} Something went wrong!`) };
        });
    }
}