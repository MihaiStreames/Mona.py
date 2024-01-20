const Discord = require('discord.js');
const main = require('../index.js');
const db = main.db;
const fs = require('fs');
const discordBot = main.discordBot;
const starcatchChannelsJSON = main.starcatchChannelsJSON;

// Starcatch Game!
function secToMs(secs) {return secs*1000};

let rarities = [
  {
    image: "https://cdn.discordapp.com/attachments/784680433043767346/784680738317795378/level_1.gif",
    level: "Level 1",
    type: "comet",
    table: "comets",
    phrase: "A comet is falling from the sky!",
    rewardXP: 100,
    color: "#4aa6f5",
    emoji: "784784685401767946"
  },
  {
    image: "https://cdn.discordapp.com/attachments/784680433043767346/784680757460992000/level_2.gif",
    level: "Level 2",
    type: "star",
    table: "stars",
    phrase: "A star is falling from the sky!",
    rewardXP: 250,
    color: "#cc9dea",
    emoji: "784784685783449640"
  },
  {
    image: "https://cdn.discordapp.com/attachments/784680433043767346/784680760555995137/level_3.gif",
    level: "Level 3",
    type: "meteorite",
    table: "meteorites",
    phrase: "Woah! A meteorite is falling from the sky!",
    rewardXP: 500,
    color: "#fcbb67",
    emoji: "784784685766017064" 
  },
];

let starcatchGame = () => {
  let chosenStar = "";
  let randomNumber = Math.floor(Math.random() * 100); 

  // 10% is meteorite / 2500
  if (randomNumber >= 90) chosenStar = rarities[2];
  // 30% is star / 2500*0.6
  if (randomNumber < 90 && randomNumber >= 60) chosenStar = rarities[1];
  // 60% is comet / 2500*0.3
  if (randomNumber < 60) chosenStar = rarities[0];

  // Array for users that caught this round
  let usersThatCollected = [];

  const embed = new Discord.MessageEmbed()
    .setTitle(`${chosenStar["phrase"]}`)
    .setColor(`${chosenStar["color"]}`)
    .setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784687999119523850/starcatch.png`)
    .setImage(`${chosenStar["image"]}`)
    .setDescription("who will be the first ones to catch it? \n Type `!catch` to catch the star! \n You have \`30 seconds\` to catch it!")

  starcatchChannelsJSON["channels"].forEach(channelID => {
    try {
      let channel = discordBot.channels.cache.get(channelID);

      // Array for first 5 users PER SERVER
      let first5Users = [];

      channel.send(embed);
      const filter = m => m; 
      const collector = channel.createMessageCollector(filter, { time: 30000 });
      collector.on('collect', collectedMessage => {
        if (
          first5Users.length < 5 
          && !collectedMessage.author.bot 
          && collectedMessage.content.toLowerCase().includes("!catch")
          ) {
            main.commandsRan += 1;
            // If user collected the star in another/the same server tell them that they can't collect another from the same run
            if (usersThatCollected.includes(collectedMessage.author.id)) return collectedMessage.channel.send(`${collectedMessage.author} You already caught this ${chosenStar["type"]}!`)
            
          const claimedEmbed = new Discord.MessageEmbed()
            .setTitle(`Congratulations!`)
            .setColor(`${chosenStar["color"]}`)
            .setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784687999119523850/starcatch.png`)
            .setDescription(`${collectedMessage.author} \n You caught a ${chosenStar["type"]} ${main.emoji(chosenStar["emoji"])} and \`${chosenStar["rewardXP"]}XP\` ${main.emoji("784822494469160992")}`)  

          // send response that they got the star
          channel.send(collectedMessage.author, claimedEmbed);
          usersThatCollected.push(collectedMessage.author.id);
          first5Users.push(collectedMessage.author.id);
  
          if (first5Users.length == 5) {
            collector.stop()
          }

          // update on database
          db.query(`
            UPDATE users 
            SET xp = xp + ${chosenStar["rewardXP"]},
            ${chosenStar["table"]} = ${chosenStar["table"]} + 1 
            WHERE discordID = ${collectedMessage.author.id}`, (error, results, fields) => {
              console.database(`Updated user ${collectedMessage.author.id.toString().blue} from ${collectedMessage.channel.guild.name.toString().blue}`); 
          })
        } 
      });
      collector.on("end", () => {
        const starGoneEmbed = new Discord.MessageEmbed()
          .setTitle(`The ${chosenStar["type"]} disintegrated!`)
          .setColor(`${chosenStar["color"]}`)
        channel.send(starGoneEmbed);
      })

    } catch (error) { } 
  });
};

let starcatchServer = () => {
  let randomTime = Math.floor(Math.random() * secToMs(1500)) + secToMs(300); 
  console.info(`Time till next Starcatch: ${(Math.floor(randomTime / 1000 / 60) + "min").toString().cyan}`);
  setTimeout(async () => {
    starcatchGame();
    starcatchServer(); 
  }, randomTime); 
}; 

// Run starcatch
starcatchServer();

module.exports = {
  starcatchGame,
	name: 'starcatch',
	description: 'Starcatch command that shows what starcatch is and it\'s available commands',
	execute(message, args) {

		console.command(`${"!mona starcatch".magenta} in ${(message.guild.name).toString().magenta}`)

		// Setup wizard that binds/creates channels for starcatch!
		let options = {
		  setup: () => {
			if (!message.member.hasPermission('ADMINISTRATOR')) return;
			message.channel.send("Welcome to the Starcatch Setup!");
			message.channel.send("Do you want to create a new channel or use an existing one? **[new/existing]**");
			
			async function createNewFeed(message, isNew, existingChannel){  
			  
        // Create new / bind to existing channel
        
        try {
          if(isNew) var newChannel = await message.guild.channels.create("starcatch");
          if(!isNew) var newChannel = await discordBot.channels.cache.get(existingChannel);
          var fightersRole = await message.guild.roles.create({ data: { name: '🌠 Adventurer\'s Guild', color: '#808ccc', }, reason: 'for people who wanna be notified for new bosses', });
        } catch (error) {
          if (error) return message.channel.send(`${message.author} I don't have permissions to \`manage channels\` & \`manage roles\`!`);
        }

        fightersRole.setMentionable(true);
			  message.channel.send(`Made a new Role: ${fightersRole}`);

			  if (starcatchChannelsJSON.channels.includes(newChannel.id)) return message.channel.send(`Channel ${newChannel} is already bound to Starcatch`);;
			  message.channel.send(`Made a new Starcatch channel: ${newChannel}`);
			  starcatchChannelsJSON.channels.push(newChannel.id);
	
        // Save to JSON DB
        console.info(`Starcatching a new channel! ${newChannel.id.toString().cyan}`);
			  fs.writeFileSync('starcatch_channels.json', JSON.stringify(starcatchChannelsJSON));
			  console.info(`${message.author.id.toString().cyan} ${message.author.tag.toString().cyan} Added new a Starcatch channel!`);
			}; 
	
			const filter = m => m.author == message.author;
			const collector = message.channel.createMessageCollector(filter, { time: 15000 });
			collector.on('collect', async collectedMessage  => {
			  
			  // If user wants to create a new channel
			  if (collectedMessage.content == "new") {
          createNewFeed(collectedMessage, true);
          collector.stop()
			  }
			  // If user wants to use an existing channel
			  if (collectedMessage.content == "existing") {
          const subCollector = message.channel.createMessageCollector(filter, { time: 15000 });
          message.channel.send("Please tag the channel that should be used for the Starcatch Game:");
          subCollector.on('collect', async subCollectedMessage  => {
            let taggedChannel = subCollectedMessage.content.replace("<#", "").replace(">", "");
            createNewFeed(subCollectedMessage, false, taggedChannel);
            subCollector.stop()
          });
          collector.stop()
          }
        });
		  },
		}
	
		// If !mona starcatch -> show available settings
		if(!args[0]) {
		  const embed = new Discord.MessageEmbed()
			.setTitle(`Information`)
			.setDescription(`Mona has spotted stars falling from the sky... It seems like she needs your help to get them all! Help her collect comets, stars and meteorites!`)
			.addFields(
			  { name: `Commands`, inline: true, value: ["!mona xp", "!mona leaderboard"]},
			  { name: `Admin Commands`, inline: true, value: ["!mona starcatch setup"]},
			)
			.setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784687999119523850/starcatch.png`)
			.setAuthor('Starcatch v1.3', 'https://cdn.discordapp.com/attachments/784680433043767346/784687999119523850/starcatch.png', '')
			.setColor('#4aa6f5');
	
		  message.channel.send(embed);
		  return
		}
		// If !mona starcatch setup -> run setup wizard
		if(args[0] == "setup") {options.setup();} 
		if(args[0] == "drop") {
      if (message.author.id == 226609326679130112 || message.author.id == 148295829810053120 || message.author.id == 153274351561605120) return starcatchGame();
    } 
	},
};