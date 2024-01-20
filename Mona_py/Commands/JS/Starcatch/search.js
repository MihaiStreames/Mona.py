const Discord = require('discord.js');
const main = require('../index.js');
const db = main.db;

// Starcatch Game!
function secToMs(secs) {return secs*1000};

let drops = [
    {
        name: "Windwheel Aster",
        image: "https://cdn.discordapp.com/emojis/789222277258280991.png"
    },
    {
        name: "Violetgrass",
        image: "https://cdn.discordapp.com/emojis/789222277018550323.png"
    },
    {
        name: "Wolfhook",
        image: "https://cdn.discordapp.com/emojis/789222276935057469.png" 
    },
    {
        name: "Lamp Grass",
        image: "https://cdn.discordapp.com/emojis/789222277291573328.png"
    },
    {
        name: "Cecilia",
        image: "https://cdn.discordapp.com/emojis/789222276867293265.png"  
    },
    {
        name: "Qingxin",
        image: "https://cdn.discordapp.com/emojis/789222276993253377.png"
    },
    {
        name: "Calla Lily",
        image: "https://cdn.discordapp.com/emojis/789222277039259660.png"
    },
    {
        name: "Silk Flower",
        image: "https://cdn.discordapp.com/emojis/789222277295374347.png"
    }
];

let bushes = [
  {
    image: "https://cdn.discordapp.com/attachments/691139128267505664/789221503551275078/20201217215213.png",
    color: "#96c347",
  },
  {
    image: "https://cdn.discordapp.com/attachments/691139128267505664/789221504868286494/20201217215131.png",
    color: "#bbc229",
  },
  {
    image: "https://cdn.discordapp.com/attachments/691139128267505664/789221458198921236/20201217215336.png",
    color: "#ffe82b",
  },
  {
    image: "https://cdn.discordapp.com/attachments/691139128267505664/789221394797953105/20201217215925.png",
    color: "#4a6236",
  },
  {
    image: "https://cdn.discordapp.com/attachments/691139128267505664/789221512333754388/2020121721587.png",
    color: "#107a5c",
  },
]

let usersThatSearched = [];

module.exports = {
	name: 'search',
	description: 'Search in bushes and places for ingredients to cook food / dishes!',
	execute(message, args) {
        if (usersThatSearched.includes(message.author.id)) return message.channel.send(`${message.author} You can't search for more bushes yet! Try again in a few minutes!`)

        randomDrop = drops[Math.floor(Math.random() * (drops.length))];
        randomBush = bushes[Math.floor(Math.random() * (bushes.length))];

		const embed = new Discord.MessageEmbed()
            .setTitle(`You found a bush!`) 
            .setThumbnail(`${randomDrop.image}`)
            .setImage(`${randomBush.image}`)
            .setFooter(`Don't forget to do !mona vote for more rewards!`)
            .addField(`Rewards: `, [
                `${main.emoji(main.getItemByName(randomDrop.name).emoji)} \`${randomDrop.name} x1\``,
            ], true)
            .setColor(`${randomBush.color}`)
            
        try {
            message.channel.send(message.author, embed);
        } catch (error) {
            if (error) {
                console.log(error);
                message.channel.send(`${message.author}, I can't \`Attach Images\`!`);
                return
            }
        }   

        // update database with rewards
        db.query(`SELECT inventory FROM users WHERE discordID = ${message.author.id}`, (error, results, fields) => {
            const inventory = results[0].inventory; 
            const updatedInventory = JSON.stringify(main.inventoryHandler("add", randomDrop.name, inventory));

            db.query(` UPDATE users SET inventory = '${updatedInventory}' WHERE discordID = ${message.author.id}`, (error, results, fields) => {
                console.database(`Updated user ${message.author.id.toString().blue}`); 
            });
        })

        // Add user to array
        usersThatSearched.push(message.author.id);
        // Remove the first user after 5 mins so they can search again
        setTimeout(() => {
            usersThatSearched.shift();  
        }, 300000);
    }
}