import nextcord
import datetime
from Mona_py.logger import log
from Mona_py.json_db import voicelinesJSON


async def hello(message: nextcord.Message, client):
    log("command", f"!mona hello in {message.guild.name}")

    current_time = datetime.datetime.now().hour
    response = ""
    
    if 6 <= current_time < 12:
        response = voicelinesJSON["hello"]["timeRelativeResponses"]["response1"]
    if 12 <= current_time < 16:
        response = voicelinesJSON["hello"]["timeRelativeResponses"]["response2"]
    if 16 <= current_time < 22:
        response = voicelinesJSON["hello"]["timeRelativeResponses"]["response3"]
    if current_time >= 22 or current_time < 6:
        response = voicelinesJSON["hello"]["timeRelativeResponses"]["response4"]
    
    await message.channel.send(f"{message.author.mention} {response}")
