import nextcord
from Mona_py.logger import log
from Mona_py.Commands.Types import autorole, starred_messages


commands = {
    "emoji": autorole.emoji,
    "star": starred_messages.star,
}

## TODO: Make the main reaction command which will setup the channel and so on, which will be watched by the bot
## (for any new reactions, etc)

async def reaction(message: nextcord.Message, client):
    log("command", f"!mona reaction {message.guild.name}")
    reaction_type = message.content.split()[3]

    if reaction_type in commands:
        await commands[reaction_type](message, client)