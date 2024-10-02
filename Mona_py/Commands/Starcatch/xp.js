const Discord = require('discord.js');
const main = require('../index.js');
const discordBot = main.discordBot;
var db = main.db;


module.exports = {
    name: 'xp',
    description: 'Shows a user\'s XP and statistics',

    execute(message, args) {
        console.command(`${"!mona xp".magenta} in ${(message.guild.name).toString().magenta}`);
        let user = message.author.id;
        let title = "Your Stats";

        // If user wants to check someone else's xp
        if (message.mentions.users.first()) {
            user = message.mentions.users.first().id;
            title = `${message.mentions.users.first().username}'s Stats`;
        }

        db.query(`SELECT xp, comets, stars, meteorites FROM users WHERE discordID = ${user}`, (error, results, fields) => {
            const embed = new Discord.MessageEmbed()
                .setTitle(title)
                .setDescription(`Here's what you've caught so far!`)
                .addFields(
                    {
                        name: `Comets:`,
                        inline: true,
                        value: `${main.emoji("784784685401767946")} \`${results[0].comets}\``
                    },
                    {
                        name: `Stars:`,
                        inline: true,
                        value: `${main.emoji("784784685783449640")} \`${results[0].stars}\``
                    },
                    {
                        name: `Meteorites:`,
                        inline: true,
                        value: `${main.emoji("784784685766017064")} \`${results[0].meteorites}\``
                    },
                    {
                        name: `Total XP:`,
                        inline: true,
                        value: `${main.emoji("784822494469160992")} \`${results[0].xp}\``
                    },
                    {
                        name: `Level:`,
                        inline: true,
                        value: `${main.emoji("784822477561790484")} \`${main.resolveLevel(results[0].xp)}\``
                    },
                )

                .setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784687999119523850/starcatch.png`)
                .setColor('#4aa6f5');

            message.channel.send(embed);
        })
    },
};