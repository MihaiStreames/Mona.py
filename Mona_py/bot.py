import nextcord
import os
import datetime

from Commands import hello, chat, reaction, help, ascii, epic_games
from DB.main import JSONDB
from nextcord.ext import tasks
from logger import log
from dotenv import load_dotenv

load_dotenv()

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
db = JSONDB("../DB/database.json")

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


@tasks.loop(hours=24)
async def daily_free_games_check():
    log("start", "Checking for free games at " + str(datetime.datetime.now()))
    games = epic_games.check_epic_games(db)
    await send_announcement(1188834401732280390, games, db)


async def send_announcement(channel_id, games, db):
    channel = client.get_channel(channel_id)

    for game in games:
        embed = nextcord.Embed(title=f'FREE GAME! {game["title"]}', color=0x60f923, description=game["description"])
        embed.set_image(url=game["image_url"])
        await channel.send(embed=embed)
        db.add_announced_game(game['id'])


@client.event
async def on_ready():
    if db:
        log("start", "DB loaded!")

    log("start", f"{client.user.name} is ready!")
    daily_free_games_check.start()

    log("start", "Daily free games check started!")
    await client.change_presence(activity=nextcord.Activity(type=nextcord.ActivityType.listening, name="!mona (.py)"))


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


# Run the bot
client.run(DISCORD_TOKEN)