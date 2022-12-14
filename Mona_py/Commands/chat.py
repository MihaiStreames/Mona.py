import discord
import json

intents = discord.Intents.all()
client = discord.Client(intents=intents)

with open("../voicelines.json") as f:
    voicelinesJSON = json.load(f)


async def chat(message: discord.Message):
    print(f"!chat in {message.guild.name}")

    await message.channel.send(f"{message.author.mention} What do you want to chat about?")

    # gets the topics
    value_string = ""
    for keys in voicelinesJSON:
        # if input contains key name print possible values
        if keys == "chat":
            for elem in voicelinesJSON[keys]:
                value_string += elem + "\n"

    # embeds the topics
    embed = discord.Embed(color=discord.Color.from_str("#373e58"), description=message.content)
    embed.title = "Available Topics (so far)"
    embed.add_field(name="Topics", inline=True, value=value_string)

    await message.channel.send(embed=embed)

    def filter(m):
        return m.author == message.author

    collector = await client.wait_for('message', check=filter, timeout=10000)

'''
    //Embeds the topics
    const embed = new Discord.MessageEmbed()
      .setTitle(`Available Topics (so far)`)
      .setColor('#373e58')
      .addFields(
        { name: `Topics`, inline: true, value: Object.keys(voicelinesJSON["chat"]) },
      );

    message.channel.send(embed);
    // Filters the message sent afterwards
    const filter = m => m.author == message.author;
    const collector = message.channel.createMessageCollector(filter, { time: 10000 });
    // Sends a random line from the chosen category
    collector.on('collect', collectedMessage => {

      // if user types something that isnt a topic she can talk about return
      if (!Object.keys(voicelinesJSON["chat"]).includes(collectedMessage.content)) return
      collectedMessage.channel.send(voicelinesJSON["chat"][collectedMessage.content.toLowerCase()][Math.floor(Math.random() * voicelinesJSON["chat"][collectedMessage.content].length)].split("$"));
      collector.stop();
    });    
	},
};
'''
