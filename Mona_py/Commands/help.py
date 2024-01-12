import nextcord
from Mona_py.logger import log


async def help(interaction: nextcord.Interaction, commands):
    log("command", f"Slash command /help used in {interaction.guild.name}")

    embed = nextcord.Embed(
        title="Mona's Catalyst",
        color=nextcord.Color.blue(),
        description="Mona is a versatile Discord bot featuring a variety of slash commands for entertainment, information, and more."
    )

    embed.set_thumbnail(url="https://cdn.discordapp.com/attachments/1051774224005607494/1054491332040724602/category.png")

    # Starcatch Setup
    embed.add_field(
        name="Starcatch Setup (WIP)",
        value="A new and improved Starcatch game is in the works! Stay tuned for updates and setup instructions."
    )

    # Fun Commands
    fun_commands = "\n".join([f"/{cmd}" for cmd in commands["fun"]])
    embed.add_field(name="Fun Commands", value=fun_commands)

    # Admin/Setup Commands
    admin_commands = "\n".join([f"/{cmd}" for cmd in commands["admin"]])
    embed.add_field(name="Admin/Setup Commands", value=admin_commands)

    try:
        await interaction.response.send_message(embed=embed)
    except nextcord.errors.Forbidden:
        log("warning", f"Permissions forbidden in {interaction.guild.name}")
        await interaction.followup.send(f"{interaction.user.mention} I don't have permissions to do that!")