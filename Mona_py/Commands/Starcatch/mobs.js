const Discord = require('discord.js');
const main = require('../index.js');
const fs = require('fs');
const db = main.db;
const discordBot = main.discordBot;
const starcatchChannelsJSON = main.starcatchChannelsJSON;
const itemsJSON = JSON.parse(fs.readFileSync('items.jsonc'));

// Starcatch Game!
function secToMs(secs) {return secs*1000};

let mobs = [
  {
    name: "Hilichurl", 
    hp: 1350, 
    rewardMora: 250,
    rewardXP: 50,
    image: "https://cdn.discordapp.com/attachments/784680433043767346/787828826482409512/Monster_Hilichurl.png",
    thumbnail: "https://cdn.discordapp.com/attachments/784680433043767346/787828813370884137/Hili_None.png",
    color: "#f4c460",
  },
  {
    name: "Hydro Abyss Mage",
    hp: 2350,
    rewardMora: 650,
    rewardXP: 125,
    image: "https://cdn.discordapp.com/attachments/784680433043767346/787850511994060820/b5026feaef8ffbf015740fd36deec75c_6269891241443247045.png",
    thumbnail: "https://cdn.discordapp.com/attachments/784680433043767346/787849863873953812/latest.png",
    color: "#f4c460",
  },
  {
    name: "Pyro Abyss Mage",
    hp: 2350, 
    rewardMora: 650,
    rewardXP: 125,
    image: "https://cdn.discordapp.com/attachments/784680433043767346/787850482604965888/5670fb38620edba526c4b4fcf1f2ccc8_5006493427538498077.png",
    thumbnail: "https://cdn.discordapp.com/attachments/784680433043767346/787849874200723486/latest.png",
    color: "#f4c460",
  },
  {
    name: "Cryo Abyss Mage",
    hp: 2350, 
    rewardMora: 650,
    rewardXP: 125,
    image: "https://cdn.discordapp.com/attachments/784680433043767346/787850535298531328/magos-cyro.png",
    thumbnail: "https://cdn.discordapp.com/attachments/784680433043767346/787849887537954816/latest.png",
    color: "#f4c460",
  },
  { 
    name: "Eye of the Storm",
    hp: 4000,
    rewardMora: 850,
    rewardXP: 250,
    image: "https://cdn.discordapp.com/attachments/784680433043767346/785609167876128838/show.png",
    thumbnail: "https://cdn.discordapp.com/attachments/784680433043767346/785609043829456926/256.png",
    color: '#4fb490',
  },
];

let spawnMob = () => {
  let randomMob = mobs[Math.floor(Math.random() * mobs.length)]; 

  const embed = new Discord.MessageEmbed()
    .setTitle(`A random ${randomMob.name} appeared!`)
    .setColor(`${randomMob.color}`)
    .setThumbnail(`${randomMob.thumbnail}`)
    .addField(`HP:`, `\`${randomMob.hp}\``, true)
    .setImage(`${randomMob.image}`)

  let dumbassChannel = ["783110856874917929"];

  starcatchChannelsJSON.channels.forEach(async channelID => {
    let messagesForDeletion = [];
    let channel = await discordBot.channels.cache.get(channelID);
    let mobHP = randomMob.hp * 2; 
    try { 
      // Try sending an embed in the channel
      messagesForDeletion.push(await channel.send(embed));
    }
    catch(error) { 
      if (error) {
        try {
          // If mona can't send the embed send a message saying she doesn't have permissions
          console.info(`Messaging channel ${channel.id.cyan} that Mona doesn't have permission`);
          await channel.send(`${channel.guild.owner} I don't have permissions to \`Embed Links\`!`);
        } catch (error) {
          console.error(`Ignored channel ${channel.id.red} due to error`);
        }
      } 
    }

    const filter = m => m; 
    const collector = channel.createMessageCollector(filter, { time: 30000 });

    let usersThatDealtDamage = []; 
    let attacks = -1;

    collector.on('collect', collectedMessage => {
      if ( !collectedMessage.author.bot && collectedMessage.content.includes("!attack")) {
          if(!usersThatDealtDamage.includes(collectedMessage.author.id)) usersThatDealtDamage.push(collectedMessage.author.id);

          let userDamage = 0;

          // get user's weapon damage
          db.query(`SELECT xp, equipped_weapon, buffs FROM users WHERE discordID = ${collectedMessage.author.id}`, async (error, results, fields) => {
            try {

              let atkMultipler = 0;

              // Store the buffs we get from the database
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
                    db.query(`UPDATE users SET buffs = '${JSON.stringify(buffs)}' WHERE discordID = ${collectedMessage.author.id}`, (error, results, fields) => {
                      console.database(`Updated user ${collectedMessage.author.id.toString().blue} from ${collectedMessage.channel.guild.name.toString().blue}`);
                    });
                  }
                })
              }

              // user's equipped weapon
              let usersWeapon = results[0].equipped_weapon;

              // iterate through the entire weaponlist and find the user's weapon damage
              itemsJSON.items.forEach(weapon => {
                if (weapon.name == usersWeapon) userDamage = weapon.damage;
              });
               
              // remove life from boss
              let atk = (parseInt(userDamage) + (parseInt(userDamage) * (parseInt(atkMultipler) / 100)) + (main.resolveLevel(results[0].xp) * 4));

              mobHP -= atk;
              attacks += 1;

              if (mobHP <= 0) return collector.stop(); 

              // send status every 10 attacks
              const currentHP = new Discord.MessageEmbed()
                .setTitle(`Damage dealt!`)
                .setAuthor(`${randomMob.name}`, `${randomMob.thumbnail}`, '')
                .addField(`HP:`, `\`${mobHP.toFixed(0) * 2}HP\` left!`, true)
                .setColor(`${randomMob.color}`)
      
              messagesForDeletion.push(await channel.send(currentHP));
            } catch (error) {
              console.log(error);
					    collectedMessage.channel.send(`${collectedMessage.author}, there was an error loading your inventory, please inform the owners.`);
            }
          });
      }
    });
    collector.on("end", () => {
      if (mobHP > 0) {
        const mobFailEmbed = new Discord.MessageEmbed()
          .setTitle(`No one killed the ${randomMob.name} and he got away!`)
          .setColor(`${randomMob.color}`)
          .setThumbnail(`${randomMob.thumbnail}`)
        channel.send(mobFailEmbed);
        return
      }
      messagesForDeletion.forEach(message => message.delete());
      const rewardsEmbed = new Discord.MessageEmbed()
        .setTitle(`You killed the ${randomMob.name}!`)
        .setAuthor(`${randomMob.name}`, `${randomMob.thumbnail}`, '')
        .setThumbnail(`${randomMob.thumbnail}`)
        .addField(`Fighters:`, usersThatDealtDamage.map(user => `<@${user}>`), true)
        .addField(`Rewards: `, [
          `${main.emoji("784822494469160992")} \`${randomMob.rewardXP} XP\``,
          `${main.emoji("784748211113033739")} \`${main.formatMoney(randomMob.rewardMora)} Mora\``,
        ], true)
        .setColor(`${randomMob.color}`)
      channel.send(rewardsEmbed);

      usersThatDealtDamage.forEach(user => {
        // update database with rewards  
        db.query(` 
          UPDATE users 
          SET xp = xp + ${randomMob.rewardXP},
          mora = mora + ${randomMob.rewardMora}
          WHERE discordID = ${user}`, (error, results, fields) => {
            console.database(`Updated user ${user.toString().blue} from ${channel.guild.name.toString().blue}`); 
        }) 
      });
    });
  });
};

let spawnMobServer = () => {
  let randomTime = Math.floor(Math.random() * secToMs(300)) + secToMs(300); 
  console.info(`Time till next Mob: ${(Math.floor(randomTime / 1000 / 60) + "min").toString().cyan}`);
  setTimeout(async () => {
    spawnMob();
    spawnMobServer(); 
  }, randomTime); 
}; 

// Run bossfight
spawnMobServer(); 
module.exports = {
  spawnMob,
	name: 'mobs',
	description: 'mobs command that shows what bossfight is and it\'s available commands',
	async execute(message, args) {
		
    console.command(`${"!mona mob".magenta} in ${(message.guild.name).toString().magenta}`)

    // If !mona bossfight -> show available settings
		if(!args[0]) {
		  const embed = new Discord.MessageEmbed()
        .setTitle(`Information`)
        .setDescription(`Every few minutes, a mob appears and can be killed for XP / Mora. \n \n mobs spawn in the starcatch channels, so make sure you've setup starcatch with \`!mona starcatch setup\``)
        .setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784744450663907358/bossfight.png`)
        .setAuthor('Mobs v1.0', 'https://cdn.discordapp.com/attachments/784680433043767346/784744450663907358/bossfight.png', '')
        .setColor('#8f6ff9');
		}
    
		// If !mona bossfight sendboss -> spawn a boss in all servers
		if(args[0] == "drop") {
      if (message.author.id == 226609326679130112 || message.author.id == 153274351561605120) return spawnMob();
    } 
	},
};