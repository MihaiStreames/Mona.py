const Discord = require('discord.js');
const main = require('../index.js');
const fs = require('fs');
const db = main.db;
const discordBot = main.discordBot;
const starcatchChannelsJSON = main.starcatchChannelsJSON;
const itemsJSON = JSON.parse(fs.readFileSync('items.jsonc'));

// Starcatch Game!
function secToMs(secs) { return secs * 1000 }

// Why tf are bosses stored here
let bosses = [
    {
        name: "Geo Hypostasis",
        hp: 150000,
        rewardMora: 5200,
        rewardXP: 1200,
        image: "https://cdn.discordapp.com/attachments/784680433043767346/784874163805880330/ezgif-4-93bf1ac34861.gif",
        thumbnail: "https://cdn.discordapp.com/attachments/784680433043767346/784870445655654410/256.png",
        color: "#f4c460",
        drops: [
            "Prithiva Topaz",
        ],
    },
    {
        name: "Electro Hypostasis",
        hp: 125000,
        rewardMora: 5000,
        rewardXP: 1000,
        image: "https://cdn.discordapp.com/attachments/784680433043767346/784843131144765470/electro_hypostasis.gif",
        thumbnail: "https://cdn.discordapp.com/attachments/784680433043767346/784743823397617734/Monster_Electro_Hypostasis_thumb.png",
        color: "#8f6ff9",
        drops: [
            "Vajrada Amethyst",
        ],
    },
    {
        name: "Anemo Hypostasis",
        hp: 100000,
        rewardMora: 4800,
        rewardXP: 950,
        image: "https://cdn.discordapp.com/attachments/784680433043767346/784875531849170994/ezgif-4-efc00021669f.gif",
        thumbnail: "https://cdn.discordapp.com/attachments/784680433043767346/784873242283999273/256.png",
        color: "#27f7f2",
        drops: [
            "Vayuda Turquoise",
        ],
    },
    {
        name: "Pyro Regisvine",
        hp: 75000,
        rewardMora: 3000,
        rewardXP: 725,
        image: "https://cdn.discordapp.com/attachments/784680433043767346/786318932481933396/ezgif-6-6542cbee9296.gif",
        thumbnail: "https://cdn.discordapp.com/attachments/784680433043767346/785605544458453063/256.png",
        color: '#e3310d',
        drops: [
            "Agnidus Agate",
        ],
    },
    {
        name: "Cryo Regisvine",
        hp: 70000,
        rewardMora: 2500,
        rewardXP: 650,
        image: "https://cdn.discordapp.com/attachments/784680433043767346/786319804868067399/ezgif-6-954e6c3af0da.gif",
        thumbnail: "https://cdn.discordapp.com/attachments/784680433043767346/785605966904688690/256.png",
        color: '#36bbfc',
        drops: [
            "Shivada Jade",
        ],
    },
    {
        name: "Andrius",
        hp: 1250000,
        rewardMora: 34500,
        rewardXP: 8000,
        image: "https://cdn.discordapp.com/attachments/784680433043767346/786321270273736705/ezgif-6-0548743a7854.gif",
        thumbnail: "https://cdn.discordapp.com/attachments/784680433043767346/786027707959738399/256.png",
        color: '#0b7afe',
        drops: [
            "Varunada Lazurite",
        ],
    },
];

let b1gb0ss = {
    //{
    //   name: "Wolf",
    //   hp: 45000,
    //   rewardMora: 12250,
    //   rewardXP: 3200,
    //   image: soon
    //   thumbnail: too
    //   color: '#6666ff'
    // },
    //{
    //   name: "Tarta",
    //   hp: 50000,
    //   rewardMora: 14500,
    //   rewardXP: 3500,
    //   image: soon
    //   thumbnail: too
    //   color: '#6666ff'
    // },
}

let bossfightGame = () => {
    let randomBoss = bosses[Math.floor(Math.random() * bosses.length)];

    const embed = new Discord.MessageEmbed()
        .setTitle(`A random ${randomBoss.name} appeared!`)
        .setColor(`${randomBoss.color}`)
        .setThumbnail(`${randomBoss.thumbnail}`)
        .addField(`HP:`, `\`${randomBoss.hp}\``, true)
        .setAuthor('Bossfight v1.1', 'https://cdn.discordapp.com/attachments/784680433043767346/784744450663907358/bossfight.png', '')
        .setImage(`${randomBoss.image}`)
        .setDescription(`Type \`!attack\` to attack the ${randomBoss.name}! \n You have \`5 minutes\` to kill it!`)

    let dumbassChannel = ["783110856874917929"]; //?

    starcatchChannelsJSON.channels.forEach(async channelID => {

        let timerStart = new Date().getTime();

        let channel = await discordBot.channels.cache.get(channelID);
        let role = channel.guild.roles.cache.find(r => r.name === "🌠 Adventurer's Guild");

        let bossHP = randomBoss.hp;

        channel.send(role, embed);
        const filter = m => m;
        const collector = channel.createMessageCollector(filter, {time: 300000});

        let usersThatDealtDamage = [];
        let attacks = -1;

        collector.on('collect', collectedMessage => {
            if (!collectedMessage.author.bot && collectedMessage.content.includes("!attack")) {
                main.commandsRan += 1;

                if (!usersThatDealtDamage.includes(collectedMessage.author.id)) usersThatDealtDamage.push(collectedMessage.author.id);

                let userDamage = 0;

                // Get user's weapon damage
                db.query(`SELECT xp, equipped_weapon, buffs FROM users WHERE discordID = ${collectedMessage.author.id}`, (error, results, fields) => {
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
                                } else {
                                    buffs[buffType].splice(index, 1);
                                    db.query(`UPDATE users SET buffs = '${JSON.stringify(buffs)}' WHERE discordID = ${collectedMessage.author.id}`, (error, results, fields) => {
                                        console.database(`Updated user ${collectedMessage.author.id.toString().blue} from ${collectedMessage.channel.guild.name.toString().blue}`);
                                    });
                                }
                            })
                        }

                        // User's equipped weapon
                        let userWeapon = results[0].equipped_weapon;

                        // Iterate through the entire weapon list and find the user's weapon damage
                        itemsJSON.items.forEach(weapon => {
                            if (weapon.name === userWeapon) userDamage = weapon.damage;
                        });

                        // Remove life from boss
                        let atk = (parseInt(userDamage) + (parseInt(userDamage) * (parseInt(atkMultipler) / 100)) + (main.resolveLevel(results[0].xp) * 4));

                        bossHP -= atk;
                        attacks += 1;

                        if (bossHP <= 0) return collector.stop();

                        // Send status every 10 attacks
                        if (attacks % 10 === 0) {
                            const currentHP = new Discord.MessageEmbed()
                                .setTitle(`Damage dealt!`)
                                .setAuthor(`${randomBoss.name}`, `${randomBoss.thumbnail}`, '')
                                .addField(`HP:`, `\`${bossHP.toFixed(0)}HP\` left!`, true)
                                .setColor(`${randomBoss.color}`)

                            channel.send(currentHP);
                        }
                    } catch (error) {
                        console.log(error);
                        collectedMessage.channel.send(`${collectedMessage.author}, there was an error loading your inventory, please inform the owners.`);
                    }
                });
            }
        });

        collector.on("end", () => {
            if (bossHP > 0) {
                const bossFailEmbed = new Discord.MessageEmbed()
                    .setTitle(`No one killed the ${randomBoss.name} and it got away!`)
                    .setColor(`${randomBoss.color}`)
                    .setThumbnail(`${randomBoss.thumbnail}`)
                    .setAuthor('Bossfight v1.1', 'https://cdn.discordapp.com/attachments/784680433043767346/784744450663907358/bossfight.png', '')
                    .setFooter(`${attacks + 1} total attacks`)

                channel.send(bossFailEmbed);
                return
            }

            let timer = (new Date().getTime() - timerStart) / 1000;

            const bossRewardsEmbed = new Discord.MessageEmbed()
                .setTitle(`You killed the ${randomBoss.name}!`)
                .setAuthor(`${randomBoss.name}`, `${randomBoss.thumbnail}`, '')
                .setThumbnail(`${randomBoss.thumbnail}`)
                .setFooter(`Boss killed in ${timer}s with ${attacks + 1} attacks | ${(randomBoss.hp / timer).toFixed(2)} DPS`)
                .addField(`Fighters:`, usersThatDealtDamage.map(user => `<@${user}>`), true)
                .addField(`Rewards: `, [
                    `${main.emoji("784822494469160992")} \`${randomBoss.rewardXP} XP\``,
                    `${main.emoji("784748211113033739")} \`${main.formatMoney(randomBoss.rewardMora)} Mora\``,
                    `${main.emoji(main.getItemByName(randomBoss.drops[0]).emoji)} \`x1 ${randomBoss.drops[0]}\``
                ], true) // I've to figure out these emojis
                .setColor(`${randomBoss.color}`)
            channel.send(bossRewardsEmbed);

            usersThatDealtDamage.forEach(user => {
                // Update database with rewards
                db.query(`SELECT inventory FROM users WHERE discordID = ${user}`, (error, results, fields) => {
                    const inventory = results[0].inventory;
                    const updatedInventory = JSON.stringify(main.inventoryHandler("add", randomBoss.drops[0], inventory));

                    db.query(`
                        UPDATE users
                        SET xp        = xp + ${randomBoss.rewardXP},
                            mora      = mora + ${randomBoss.rewardMora},
                            inventory = '${updatedInventory}'
                        WHERE discordID = ${user}`, (error, results, fields) => {
                        console.database(`Updated user ${user.toString().blue}`);
                    })
                });
            });
        });
    });
};

let bossfightServer = () => {
    let randomTime = Math.floor(Math.random() * secToMs(3000)) + secToMs(600);
    console.info(`Time till next Bossfight: ${(Math.floor(randomTime / 1000 / 60) + "min").toString().cyan}`);
    setTimeout(async () => {
        bossfightGame();
        bossfightServer();
    }, randomTime);
};

// Run bossfight
bossfightServer();
module.exports = {
    bossfightGame,
    name: 'bossfight',
    description: 'Bossfight command that shows what bossfight is and it\'s available commands',

    execute(message, args) {
        console.command(`${"!mona bossfight".magenta} in ${(message.guild.name).toString().magenta}`)
        // If !mona bossfight -> show available settings
        if (!args[0]) {
            const embed = new Discord.MessageEmbed()
                .setTitle(`Information`)
                .setDescription(`Every few minutes, a boss appears and can be killed. Assemble your forces and fight it! \n \n Bosses spawn in the starcatch channels, so make sure you've setup starcatch with \`!mona starcatch setup\``)
                .setThumbnail(`https://cdn.discordapp.com/attachments/784680433043767346/784744450663907358/bossfight.png`)
                .setAuthor('Bossfight v1.1', 'https://cdn.discordapp.com/attachments/784680433043767346/784744450663907358/bossfight.png', '')
                .setColor('#8f6ff9');

            message.channel.send(embed);
            return
        }

        // If !mona bossfight sendboss -> spawn a boss in all servers
        if (args[0] == "drop") {
            if (message.author.id == 226609326679130112 || message.author.id == 153274351561605120) return bossfightGame();
            // Probably George and Mihai IDs
        }
    },
};