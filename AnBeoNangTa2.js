require('dotenv').config(); 
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const app = express();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages, 
  ],
});
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID; 
client.once('ready', () => {
  console.log('Bot is ready!');
});
app.get('/api/Darkbear', async (req, res) => {
  let jobId = null;
  let playerCount = null;
  let bossName = null;
  let responseSent = false;

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel) {
      return res.status(404).json({
        status: 'error',
        message: 'Channel not found',
      });
    }
    const messages = await channel.messages.fetch({ limit: 5 });

    if (messages.size === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No messages found in this channel',
      });
    }
    messages.each((message) => {
      message.embeds.forEach((embed) => {
        embed.fields.forEach((field) => {
          if (field.name === 'Job Id') {
            jobId = field.value;
          }
          if (field.name === 'Player Count') {
            playerCount = field.value;
          }
          if (field.name === 'Boss Name') {
            if (field.value === 'Darkbear') {
              bossName = field.value;
            }
          }
        });
      });
      if (jobId && playerCount && bossName && !responseSent) {
        responseSent = true;
        return res.json({
          status: 'success',
          data: {
            playerCount: playerCount,
            jobId: jobId,
            bossName: bossName,
          },
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

client.login(TOKEN);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
