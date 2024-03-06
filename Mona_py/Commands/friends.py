import nextcord

from Mona_py.logger import log
from Mona_py.json_opener import voicelinesJSON


async def friends(interaction: nextcord.Interaction, character_name: str = None):
    log("command", f"Slash command /friends {character_name} used in {interaction.guild.name}")

    if character_name.lower not in voicelinesJSON["friends"]:
        await interaction.response.send_message("Who is that? I—I don't think I ever met them before...")
        return

    await interaction.response.send_message(voicelinesJSON["friends"][character_name])