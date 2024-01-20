import nextcord
from nextcord.ext import commands, tasks
import os
import datetime

from Commands import hello, chat, autocrop, help, ascii, epic_games, ms, tips
from DB.main import JSONDB
from logger import log
from dotenv import load_dotenv

load_dotenv()

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
db = JSONDB("../DB/database.json")

### JSONDB ###

def export_global_commands():
    global_commands = {
        'fun': ['chat', 'ascii', 'hello', 'ask', 'autocrop', 'tips'],
        'admin': ['reaction', 'starcatch', 'ms']
    }

    for category, commands in global_commands.items():
        for command in commands:
            db.add(['commands', category], command)

### -------- ###

intents = nextcord.Intents.all()
bot = commands.Bot(intents=intents)

### Commands ###

@bot.slash_command(name="hello", description="Get a greeting from Mona!")
async def hello_slash(interaction: nextcord.Interaction):
    await hello.hello(interaction)

@bot.slash_command(name="tips", description="Gives you a random tip from Genshin Impact")
async def tips_slash(interaction: nextcord.Interaction):
    await tips.tips(interaction)

@bot.slash_command(name="chat", description="Chat with Mona!")
async def chat_slash(interaction: nextcord.Interaction):
    await chat.chat(interaction, bot)

@bot.slash_command(name="ms", description="Checks mona's response time (must be admin)")
async def ms_slash(interaction: nextcord.Interaction):
    await ms.ms(interaction)

@bot.slash_command(name="help", description="Get help and command information")
async def help_slash(interaction: nextcord.Interaction):
    await help.help(interaction, db.get_global_commands())

@bot.slash_command(name="autocrop", description="Automatically crops transparent pixels from a PNG")
async def autocrop_slash(interaction: nextcord.Interaction, attachment: nextcord.Attachment):
    await autocrop.autocrop(interaction, attachment)

@bot.slash_command(name="ascii", description="Convert an image to ASCII art")
async def ascii_slash(interaction: nextcord.Interaction, attachment: nextcord.Attachment):
    await ascii.ascii(interaction, attachment)

### -------- ###

### Tasks ###

@tasks.loop(hours=1)
async def free_games_check():
    now = datetime.datetime.now()

    if now.hour == 17:
        log("info", "Performing daily free game(s) check!")
        games = epic_games.check_epic_games(db)
        await send_announcement(1188834401732280390, games, db)

async def send_announcement(channel_id, games, db):
    channel = bot.get_channel(channel_id)

    for game in games:
        # Construct the Epic Store URL
        epic_store_url = f"https://store.epicgames.com/en-US/p/{game['slug']}"

        embed_title = f"New Free Game in Epic Store!"
        embed_description = f"**{game['title']}**\n{game['description']}"
        embed = nextcord.Embed(title=embed_title, url=epic_store_url, color=nextcord.Color.blue(), description=embed_description)

        if game["image_url"]:
            embed.set_image(url=game["image_url"])

        await channel.send(embed=embed)
        db.add(['announced_games'], game["slug"])

### -------- ###

### Extra ###

@bot.event
async def on_ready():
    try:
        if db:
            export_global_commands()
            log("start", "DB loaded!")
        else:
            log("error", "Critical error: DB not loaded!")
            exit(1)

        await bot.change_presence(activity=nextcord.Activity(type=nextcord.ActivityType.listening, name="!mona (.py)"))
        free_games_check.start()
        log("start", f"{bot.user.name} is ready!")
    except Exception as e:
        log("error", f"Error in on_ready: {e}")

@bot.event
async def on_member_join(member):
    welcome_channel = bot.get_channel(1041162913529995267)
    await send_welcome_message(welcome_channel, member)

async def send_welcome_message(channel, member):
    await channel.send(f"{member.mention} Welcome!")
    await channel.send("https://media.tenor.com/4WvbjPe0B_wAAAAC/heres-pipe.gif")

### -------- ###

# Run the bot
bot.run(DISCORD_TOKEN)