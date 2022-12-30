import nextcord
import os
from logger import log
from Mona_py.Commands import hello, chat, help, reaction, ascii
from dotenv import load_dotenv
from Mona_py.json_db import DBInstance

load_dotenv()

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')

# create the bot
intents = nextcord.Intents.all()
client = nextcord.Client(intents=intents)

commands = {
    "hello": hello.hello,
    "chat": chat.chat,
    "ask": lambda message, client: message.channel.send("That command is being worked on !!!"),
    "starcatch": lambda message, client: message.channel.send("That command is being worked on !!!"),
    "reaction": reaction.reaction,
    "help": help.help,
    "ascii": ascii.ascii
}


@client.event
async def on_ready():
    log("start", f"{client.user.name} is ready!")
    await client.change_presence(activity=nextcord.Activity(type=nextcord.ActivityType.listening, name="!mona (.py)"))

#@client.event
#async def on_disconnect(): DBInstance.save()
@client.event
async def on_close(): DBInstance.save()

@client.event
async def on_message(message):
    # we do not want the bot to reply to itself
    if message.author == client.user:
        return

    if message.content.startswith('!mona'):
        command_words = message.content.split()
        command = command_words[1][:]

        if command in commands:
            await commands[command](message, client)
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


# run the bot
client.run(DISCORD_TOKEN)
