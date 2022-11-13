use serenity::async_trait;
use serenity::prelude::*;
use serenity::model::prelude::*;
use serenity::model::channel::Message;

struct Handler;

#[async_trait]
impl EventHandler for Handler {
    async fn ready(&self, _: Context, ready: Ready) {
        println!("{} is connected!", ready.user.name);
    }

	async fn message(&self, ctx: Context, msg: Message) {
		if  msg.author.id != UserId(1032387638633693265) {
			msg.channel_id.say(&ctx.http, &msg.content).await.unwrap();
		}
	}
}

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok(); // Charger les variables environement à partir du .env
    let token = std::env::var("DISCORD_TOKEN").expect("DISCORD_TOKEN missing from env");

    //let framework = StandardFramework::new()
        // .configure(|c| c.prefix("!p")); // Changer le prefixe en "!p"
    
    let mut client = Client::builder(token, GatewayIntents::all())
        //.framework(framework)
		.event_handler(Handler)
        .await
        .expect("Error creating client");
    
    client.start().await.unwrap();
}

/*
#[group]
#[commands(reply)]
struct General;

#[command]
async fn message(&self, ctx: Context, msg: Message/*, mut args: Args*/) -> CommandResult {
    msg.channel_id.say(&ctx.http, &msg.content).await?;
	Ok(())
}
*/
/*

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
*/