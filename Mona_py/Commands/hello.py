import nextcord
import datetime

from Mona_py.logger import log
from Mona_py.json_opener import voicelinesJSON


async def hello(interaction: nextcord.Interaction):
    log("command", f"Slash command /hello used in {interaction.guild.name}")

    current_time = datetime.datetime.now().hour # Change to Mihoyo timezone
    response = ""

    if 6 <= current_time < 12:
        response = voicelinesJSON["hello"]["timeRelativeResponses"]["response1"]
    elif 12 <= current_time < 16:
        response = voicelinesJSON["hello"]["timeRelativeResponses"]["response2"]
    elif 16 <= current_time < 22:
        response = voicelinesJSON["hello"]["timeRelativeResponses"]["response3"]
    elif current_time >= 22 or current_time < 6:
        response = voicelinesJSON["hello"]["timeRelativeResponses"]["response4"]

    try:
        await interaction.response.send_message(f"{interaction.user.mention} {response}")
    except Exception as e:
        log("error", f"Error in /hello command in {interaction.guild.name}: {str(e)}")
        await interaction.followup.send(f"{interaction.user.mention} I don't have permissions to do that!")