import nextcord
from nextcord import SlashOption
from nextcord.ext import commands, tasks

import os
import datetime
import pytz

from Commands import hello, chat, autocrop, help, ascii, epic_games, ms, tips, friends
from DB.main import JSONDB
from utils import log, iso_to_unix
from dotenv import load_dotenv

load_dotenv()

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
db = JSONDB("../DB/database.json")

### JSONDB ###

def export_global_commands():
    global_commands = {
        'fun': ['chat', 'ascii', 'hello', 'ask', 'friends', 'autocrop', 'tips'],
        'admin': ['reaction', 'starcatch', 'ms']
    }

    for category, commands in global_commands.items():
        for command in commands:
            db.add(['commands', category], command)

### -------- ###

intents = nextcord.Intents.all()  # Must to change to actual intents, not just all of them (dangerous if I ever were to make a super SCARY DANGEROUS function that DELETES AN ENTIRE SERVER)
bot = commands.Bot(intents=intents)
shanghai_tz = pytz.timezone('Asia/Shanghai')

### Commands ###

@bot.slash_command(name="hello", description="Get a greeting from Mona!")
async def hello_slash(interaction: nextcord.Interaction):
    await hello.hello(interaction, shanghai_tz)

@bot.slash_command(name="friends", description="What mona thinks about her friends")
async def friends_slash(interaction: nextcord.Interaction, character_name: str = SlashOption(description="Name of the Genshin character", required=True)):
    await friends.friends(interaction, character_name)

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
    # Amazing
    current_time = datetime.datetime.now(shanghai_tz)

    if current_time.hour:
        log("info", "Performing daily free game(s) check!")
        games = epic_games.check_epic_games()
        await send_announcement(1188834401732280390, games, db, current_time)

async def send_announcement(channel_id, games, db, time):
    channel = bot.get_channel(channel_id)

    for game in games:
        if db.announced_check(game['id'], time):
            continue

        start_timestamp = iso_to_unix(game['free_from'])
        end_timestamp = iso_to_unix(game['free_until'])

        # Construct the Epic Store URL
        epic_store_url = f"https://store.epicgames.com/en-US/p/{game['slug']}"

        embed_title = f"New Free Game in Epic Store!"
        embed_description = f"**{game['title']}**\n{game['description']}"

        # Formatting dates for the embed
        embed = nextcord.Embed(title=embed_title, url=epic_store_url, color=nextcord.Color.blue(), description=embed_description)
        embed.add_field(name="Free Since:", value=f"<t:{start_timestamp}:R>", inline=True)
        embed.add_field(name="Free Until:", value=f"<t:{end_timestamp}:R>", inline=True)

        if game['image_url']:
            embed.set_image(url=game['image_url'])

        await channel.send(embed=embed)

        db.add(['announced_games'], {
            'id': game['id'],
            'slug': game['slug'],  # Just in case
            'title': game['title'],
            'free_from': game['free_from'],
            'free_until': game['free_until']
        })

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

        await bot.change_presence(activity=nextcord.Activity(type=nextcord.ActivityType.playing, name="Starcatch!"))
        free_games_check.start()
        log("start", f"{bot.user.name} is ready!")

    except Exception as e:
        log("error", f"Error in on_ready: {e}")

@bot.event
async def on_member_join(member):
    welcome_channel = bot.get_channel(1214855230035071037)
    await send_welcome_message(welcome_channel, member)

async def send_welcome_message(channel, member):
    await channel.send(f"{member.mention} Welcome!")
    await channel.send("https://media.tenor.com/4WvbjPe0B_wAAAAC/heres-pipe.gif")

### -------- ###

# Run the bot
bot.run(DISCORD_TOKEN)