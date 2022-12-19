import nextcord
import os
from Mona_py.Commands import hello, chat, help
from dotenv import load_dotenv


load_dotenv()

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')

# create the bot
intents = nextcord.Intents.all()
client = nextcord.Client(intents=intents)


@client.event
async def on_ready():
    print(f"{client.user.name} is ready!")
    await client.change_presence(activity=nextcord.Activity(type=nextcord.ActivityType.listening, name="!mona (.py)"))


@client.event
async def on_message(message):
    # we do not want the bot to reply to itself
    if message.author == client.user:
        return

    if message.content.startswith('!mona'):
        command_words = message.content.split()
        command = command_words[1][:]

        if command == "hello":
            await hello.hello(message, client)
        elif command == "chat":
            await chat.chat(message, client)
        elif command == "reaction" or command == "ask" or command == "starcatch":
            await message.channel.send("That command is being worked on !!!")
        elif command == "help":
            await help.help(message, client)
        else:
            await message.channel.send(f"I don't know *{command}* >_< !!!")


@client.event
async def on_member_join(member):
    welcome_channel = client.get_channel(1041162913529995267)
    await send_welcome_message(welcome_channel, member)


async def send_welcome_message(channel, member):
    message = member.mention
    message += "\nhttps://media.tenor.com/4WvbjPe0B_wAAAAC/heres-pipe.gif"
    await channel.send(message)


@client.event
async def on_raw_reaction_add(payload):
    if payload.emoji.name == '⭐':
        message = await client.get_channel(payload.channel_id).fetch_message(payload.message_id)
        target_channel = client.get_channel(1050924693626036334)

        embed = nextcord.Embed(
            color=nextcord.Color.blue(),
            description=f"{message.content}\n\n [**Click to jump to message!**]({message.jump_url})"
        )
        embed.set_author(name=message.author.name+"#"+str(message.author.discriminator), icon_url=message.author.avatar)
        embed.add_field(name="Sent at:", value=message.created_at.date(), inline=False)

        if message.content.startswith('https://') or message.attachments:

            attachment = message.content
            embed.set_image(url=attachment)

        await target_channel.send(embed=embed)


# run the bot
client.run(DISCORD_TOKEN)
