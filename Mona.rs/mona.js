
const version = "v0.35";
const logo = [
  "• ▌ ▄ ·.        ▐ ▄  ▄▄▄· ",
  "·██ ▐███▪▪     •█▌▐█▐█ ▀█ ",
  "▐█ ▌▐▌▐█· ▄█▀▄ ▐█▐▐▌▄█▀▀█ ",
  "██ ██▌▐█▌▐█▌.▐▌██▐█▌▐█ ▪▐▌",
  `▀▀  █▪▀▀▀ ▀█▄▀▪▀▀ █▪ ▀  ▀  ${version}`,
];
logo.forEach(line => {console.log(line.green)});

discordBot.on('ready', () => {
    // Start the API when bots ready
    require('./api/api.js');

    var dbStats = new CronJob('0 1 * * * *', function() {
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
