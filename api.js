require('dotenv').config();  // Nạp các biến môi trường từ tệp .env

const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const app = express();

// Khởi tạo bot Discord với intents cần thiết
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,  // Cần intent để truy cập vào tin nhắn
  ],
});

// Lấy token bot và channel ID từ biến môi trường
const TOKEN = process.env.DISCORD_BOT_TOKEN;  // Lấy token từ .env
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;  // Lấy Channel ID từ .env

// Đảm bảo bot đã đăng nhập trước khi trả lời API
client.once('ready', () => {
  console.log('Bot is ready!');
});

// API kiểm tra webhook và trả về jobId, playerCount và bossName nếu có
app.get('/api/status', async (req, res) => {
  let jobId = null;
  let playerCount = null;
  let bossName = null;
  let responseSent = false;

  try {
    // Lấy channel từ Discord
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel) {
      return res.status(404).json({
        status: 'error',
        message: 'Channel not found',
      });
    }

    // Lấy tin nhắn gần nhất từ channel
    const messages = await channel.messages.fetch({ limit: 5 });

    if (messages.size === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No messages found in this channel',
      });
    }

    // Kiểm tra các tin nhắn và tìm jobId, playerCount, bossName
    messages.each((message) => {
      message.embeds.forEach((embed) => {
        embed.fields.forEach((field) => {
          // Tìm thông tin Job Id
          if (field.name === 'Job Id') {
            jobId = field.value;
          }

          // Tìm thông tin Player Count
          if (field.name === 'Player Count') {
            playerCount = field.value;
          }

          // Tìm thông tin Boss Name và chỉ lấy những tên boss cụ thể
          if (field.name === 'Boss Name') {
            if (field.value === 'rip_indra True Form') {
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

// Đăng nhập bot Discord
client.login(TOKEN);

// Khởi động server Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
