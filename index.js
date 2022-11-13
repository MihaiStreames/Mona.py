const puppeteer = require('puppeteer');
async function startBrowser() {
    let browser = await puppeteer.launch({headless: true});  //set false if you wanna see the window
    
    /* //these disable the "allow notifications" popup
    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://www.reddit.com", ["geolocation", "notifications"]); */
    
    // Store the endpoint to be able to reconnect to Chromium
    const browserWSEndpoint = browser.wsEndpoint();
    // Disconnect puppeteer from Chromium
    browser.disconnect();

    return browserWSEndpoint;
}

let firstIteration = true;
let browserWSEndpoint;

const dotenv = require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
const Discord = require('discord.js');
const Twitter = require('twitter');
const discordBot = new Discord.Client({partials: ["MESSAGE", "CHANNEL", "REACTION"]});
const prefix = "!mona"
const shortPrefix = "!m"
const fs = require('fs');
const botID = "781635291710095360";
const mysql = require('mysql');
const colors = require('colors');
const needle = require('needle');
const CronJob = require('cron').CronJob;
const DBL = require("dblapi.js");
// const dbl = new DBL(, discordBot);
// const dbl = new DBL(process.env.TOP_GG_TOKEN, { webhookPort: 5000, webhookAuth: 'password' });

const version = "v0.35"; 
const logo = [
  "• ▌ ▄ ·.        ▐ ▄  ▄▄▄· ",
  "·██ ▐███▪▪     •█▌▐█▐█ ▀█ ",
  "▐█ ▌▐▌▐█· ▄█▀▄ ▐█▐▐▌▄█▀▀█ ",
  "██ ██▌▐█▌▐█▌.▐▌██▐█▌▐█ ▪▐▌",
  `▀▀  █▪▀▀▀ ▀█▄▀▪▀▀ █▪ ▀  ▀  ${version}`,
]; 
logo.forEach(line => {console.log(line.green)});

function format24h() {
  var date = new Date(); 
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  seconds = seconds < 10 ? '0'+seconds : seconds;
  var strTime = `[${hours}:${minutes}:${seconds}${ampm}]`;
  return strTime.bgWhite.black;
}

// Custom console logging methods to add cool colors and shit
console.info = message => { console.log(`${format24h()}${"[INFO]".bgCyan.black}: ${message}`); };
console.api = message => { console.log(`${format24h()}${"[API]".bgGreen.black}: ${message}`); };
console.error = message => { 
  errors += 1;
  console.log(`${format24h()}${"[ERROR]".bgRed.black}: ${message}`); 
};
console.database = message => { console.log(`${format24h()}${"[DATABASE]".bgBlue.black}: ${message}`); };
console.command = message => { console.log(`${format24h()}${"[COMMAND]".bgMagenta.black}: ${message}`); };
console.chat = message => { console.log(`${format24h()}${"[CHAT]".bgYellow.black}: ${message}`); };

var db = mysql.createConnection({ 
  host: process.env.DB_IP,
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD,
  database : process.env.DB_DB  
});
  
let usersInDatabase = [];
let commandsRan = 0;
let errors = 0;

db.connect(err => { 
  if (err) return console.error(`Couldn't connect to ${"Mona SQL Database".red}`);
  console.database(`Connected to ${"Mona SQL Database!".blue}`);

  // Get existing users from the Database
  db.query(`SELECT * FROM users`, (error, results, fields) => { 
    usersInDatabase = [...results.map(user => user.discordID)]
    console.database(`Fetched ${results.map(user => user.discordID).length.toString().blue} users!`);
  })

  // Get total commands
  db.query(`SELECT total_commands_executed FROM statistics`, (error, results, fields) => { 
    commandsRan = results[results.length - 1].total_commands_executed;
    console.database(`Fetched statistics`);
  })
});

const voicelinesJSON = JSON.parse(fs.readFileSync('voicelines.json'));
const rewardsJSON = JSON.parse(fs.readFileSync('domain_rewards.json'));
let starcatchChannelsJSON = JSON.parse(fs.readFileSync('starcatch_channels.json'))
let twitterChannelsJSON = JSON.parse(fs.readFileSync('twitter_channels.json'));

// Level formula
let formula = level => 1.3654321 * ((level - 10) * (level - 9)/2)**1.5 + 460 * (level - 10) + 2545;
const levels = [ 90, 215, 370, 555, 775, 1035, 1335, 1685, 2085, 2545 ];


// Calculate levels 10-300
for (let i = 10; i <= 300; i++) { 
  levels.push(Math.floor(formula(i)));
} 


// Export the discordBot client and other things
// so the commands in ./commands/ can access the bot client
module.exports = {
  discordBot,
  db,
  voicelinesJSON, 
  rewardsJSON,
  starcatchChannelsJSON,
  twitterChannelsJSON,
  getCommandsRan: () => {
    return commandsRan
  },
  getErrors: () => {
    return errors
  },
  randomItem: (items) => {
    return items[Math.floor(Math.random()*items.length)]; 
  },
  resolveLevel: xp => {
    for (i in levels) { 
      if (levels[i] > xp) return i
    }
  },
  emoji: id => {
    return discordBot.emojis.cache.get(id);  
  },
  cleanUpChannels: channels => {  
    let workingChannels = [];
    channels.channels.forEach((channel, index) => {
      try {
        let channelsStatus = discordBot.channels.cache.get(channel);
        workingChannels.push(channelsStatus.id);
      } catch (error) { 
        console.info(`⤷ Removed channel ${channel.toString().cyan}`)
      } 
    });
    return workingChannels;
  },
  cleanUpAll: () => {
    console.info(`Forgetting deleted Starcatch channels [1/2]`)
    starcatchChannelsJSON.channels = module.exports.cleanUpChannels(starcatchChannelsJSON);
    fs.writeFileSync('starcatch_channels.json', JSON.stringify(starcatchChannelsJSON));
    console.info(`Forgetting deleted Twitter channels [2/2]`)
    twitterChannelsJSON.channels = module.exports.cleanUpChannels(twitterChannelsJSON);
    fs.writeFileSync('twitter_channels.json', JSON.stringify(twitterChannelsJSON));
  },
  inventoryHandler: (method, item, inventory) => {
    inventory = JSON.parse(inventory);
  
    if (method == "add") {  
      if (!inventory[item]) {
        inventory[item] = 0;
      }
      inventory[item] += 1;
    }
    if (method == "remove") {
      inventory[item] -= 1; 
    }
    return inventory
  },
  formatMoney: x => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  getItemByName: name => { 
    const itemsJSON = JSON.parse(fs.readFileSync('items.jsonc'));
    let weaponObject = {};
  
    itemsJSON.items.forEach(weapon => {
      if (weapon.name == name){
        weaponObject = weapon
      }
    });
  
    return weaponObject;
  },
  addMemberToDB: member => {
    if(!usersInDatabase.includes(member.id) && !member.bot) {
      try {
        usersInDatabase.push(member.id);

        // check for weird username
        let regex = /.[a-z0-9]*#[0-9]{4}/g;  
        let parsedTag = member.tag
        if(member.tag.match(regex)[0] !== member.tag) parsedTag = "(abnormal username)"
  
        // add to db
        db.query(`INSERT INTO users (discordID, username, inventory, buffs) VALUES (${member.id}, '${parsedTag}', '{}', '{}')`, (error, results, fields) => {
          console.database(`Added ${parsedTag.blue} to database!`);
        }) 
      } catch (error) { console.log(error); };  
    }
  },
  getTotalMembers: () => {
    const guildMembers = discordBot.guilds.cache.map(guild => guild.memberCount);
    let totalGuildMembers = 0;
  
    guildMembers.forEach(guildMember => {
      if (isNaN(guildMember)) guildMember = 0;
      totalGuildMembers += guildMember;
    })

    return totalGuildMembers;
  },
};

discordBot.on('ready', () => {
  // Start the API when bots ready
  require('./api/api.js');

  var dbStats = new CronJob('0 */1 * * * *', function() {
    console.database('Updating new statistics');
    let guilds = discordBot.guilds.cache.map(guild => guild.name);
    db.query(`SELECT mora FROM users;`, (error, results, fields) => { 
      let totalMora = 0;
      results.forEach(result => totalMora += result.mora)
      db.query(`INSERT 
        INTO statistics (servers, total_members, total_commands_executed)
        VALUES (${guilds.length}, ${module.exports.getTotalMembers()}, ${module.exports.getCommandsRan()})`, (error, results, fields) => { 
          if (error) console.log(error);
        }
      )
  });

  }, null, true, 'America/Los_Angeles');

  dbStats.start();

  // cleanup channels
  module.exports.cleanUpAll();

  // Load commands from ./commands/ folder after bot is ready
  discordBot.commands = new Discord.Collection();
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    discordBot.commands.set(command.name, command);
    // Log each component loaded
    // console.info(`Loaded component: ${command.name.toString().cyan}`); 
  }

  let guilds = discordBot.guilds.cache.map(guild => guild.name);
  console.info(`Stargazing ${guilds.length.toString().cyan} servers!`);
  discordBot.user.setActivity("!mona help", {
    type: "LISTENING"
  }); 
  console.info(`Informing ${twitterChannelsJSON["channels"].length.toString().cyan} channels!`);
  console.info(`Starcatching ${starcatchChannelsJSON["channels"].length.toString().cyan} channels!`);
});
 
discordBot.on('message', async message => {
  // Add user to Mona's DB if they havent been seen this session
  module.exports.addMemberToDB(message.author);

  if(message.author.bot) return

  // Check if message is in DMs
  if(message.channel.type === 'dm' && !message.author.bot) return message.channel.send(`I don't work in DMs ${module.exports.emoji("785919559663091712")}`);

  if (message.content.toLowerCase().startsWith("!attack") || message.content.toLowerCase().startsWith("!catch")) commandsRan += 1;

  // if (message.mentions.users.first() && message.mentions.users.first().id == botID) return channel.send("!mona help");
  if (message.content.toLowerCase().startsWith(prefix) || message.content.toLowerCase().startsWith(shortPrefix)) {
    try { var command = message.content.split(" ")[1].toLowerCase(); } catch (error) {}
    try { var args = message.content.toLowerCase().split(" "); args.shift(); args.shift(); } catch (error) { console.log(error) }
    
    console.chat(`${message.author.tag} - ${message.content}`);
    
    commandsRan += 1;

    // Check for simple commands
    switch (command) {
      case "servers": return message.channel.send(`I'm stargazing \`${discordBot.guilds.cache.map(guild => guild.name).length} servers!\``);
      case "version": return message.channel.send(`Current version running: \`${version}\``);
      case "support": return message.channel.send("For more support, please join the support server: https://discord.gg/PCQfC2sSYD");
      
      // Shorthands
      case "inv": return discordBot.commands.get("inventory").execute(message, args);
      case "img": return discordBot.commands.get("image").execute(message, args);
      case "bal": return discordBot.commands.get("balance").execute(message, args);
      case "xp":
      case "exp": return discordBot.commands.get("stats").execute(message, args); 
    } 

    // Check if user's command exists in the commands collection and if so run it
    if(discordBot.commands.map(v => v.name).includes(command)) {
      if (command == "reddit" || command == "reddit2") {

        async function redditCommand() {
            
            while (firstIteration) {
                browserWSEndpoint = await startBrowser().catch(
                    //console.log("catcha bitch")
                );
                //console.log(browserWSEndpoint);
                firstIteration = false;
            };
            
            discordBot.commands.get(command).execute(message, args, Discord, discordBot, await browserWSEndpoint);
        }
        redditCommand();
    } else discordBot.commands.get(command).execute(message, args, Discord, discordBot);
    };
  }
});

discordBot.on("guildMemberAdd", member => module.exports.addMemberToDB(member));
discordBot.on('guildCreate', guild => { console.info(`Stargazing new server! ${guild.name.green}`); });
// discordBot.on('guildDelete', guild => { 
//   console.info(`Stopped stargazing ${guild.name.red}`); 
//   module.exports.cleanUpAll(); 
// });

// Login to Discord
discordBot.login(token).then(() => { console.info(`Logged in discord as ${discordBot.user.tag.cyan}`)});