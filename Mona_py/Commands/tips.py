import nextcord
from random import randint
from Mona_py.logger import log
from Mona_py.json_opener import tipsJSON


async def tips(interaction: nextcord.Interaction):
    log("command", f"Slash command /tips used in {interaction.guild.name}")

    tips_list = tipsJSON['tips']  # Access the list of tips
    num_tips = len(tips_list)
    tip_number = randint(0, num_tips - 1)
    tip = tips_list[tip_number]

    try:
        await interaction.response.send_message(f"**{tip['category']}:** {tip['content']}")
    except Exception as e:
        log("error", f"Error in /tips command in {interaction.guild.name}: {str(e)}")
        await interaction.followup.send(f"{interaction.user.mention} I don't have permissions to do that!")