import nextcord

from Mona_py.utils import log
from datetime import datetime


async def ms(interaction: nextcord.Interaction):
    log("command", f"Slash command /ms used in {interaction.guild.name}")

    if not interaction.user.guild_permissions.administrator:
        await interaction.response.send_message("You must be an administrator to use this command.")
        return

    start = datetime.now()

    try:
        await interaction.response.send_message("`0ms` Response Time")
        diff = (datetime.now() - start).total_seconds() * 1000  # Convert to milliseconds
        await interaction.edit_original_message(content=f"`{int(diff)}ms` Response Time")
    except Exception as e:
        log("error", f"Error in /ms command in {interaction.guild.name}: {str(e)}")
        await interaction.response.send_message("An error occurred while measuring response time.")