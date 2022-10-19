import discord
import json
  
# Opening JSON file
f = open(r'C:\Users\morel\Desktop\Uni\Coding\PyCharm\Discord Bot\stuff.json')
data = json.load(f)

class MyClient(discord.Client):
    async def on_ready(self):
        print(f'Logged on as {self.user}!')

    async def on_message(self, message):
        print(f'Message from {message.author}: {message.content}')

intents = discord.Intents.default()
intents.message_content = True

client = MyClient(intents=intents)
client.run(data.get("DiscToken"))