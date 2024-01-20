const Discord = require('discord.js');
const main = require('../index.js');
const Jimp = require('jimp');

module.exports = {
   name: 'autocrop',
   description: 'Automatically crops transparent pixels from a PNG',
   async execute(message, args) {
      console.command(`${"!mona autocrop".magenta} in ${(message.guild.name).toString().magenta}`)
      
      let imageURL = message.attachments.map(attachment => attachment.url)[0];
      if (imageURL == undefined) return message.channel.send(`Please attach an image alongside the command!`); 
      let image = await Jimp.read(imageURL);
      image.autocrop(0.1);
      image.write(`./temp/autocropped_${message.id}.png`); 
      
      const attachment = new Discord.MessageAttachment(`./temp/autocropped_${message.id}.png`);
      try {
         await message.channel.send(attachment); 
      } catch (error) {
         if (error) message.channel.send(`${message.author} I don't have permissions to attach files!`);
      }
   },
};