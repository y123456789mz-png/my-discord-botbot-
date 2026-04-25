import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js';

dotenv.config();

// --- خدعة رندر: سيرفر وهمي لفتح البورت ---
const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('توريال تعمل بنجاح!'));
app.listen(port, () => console.log(`سيرفر البورت شغال على منفذ: ${port}`));
// ---------------------------------------

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const memory = new Map<string, any[]>();
const processingMessages = new Set();

client.once('clientReady', (c) => {
  console.log(`✅ توريال فزت وشغالة الحين باسم: ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const isMentioned = message.mentions.has(client.user!);
  const isDM = message.guild === null;

  if ((isMentioned || isDM) && !processingMessages.has(message.id)) {
    processingMessages.add(message.id);

    try {
      let channelHistory = memory.get(message.channelId) || [];
      channelHistory.push({ role: "user", content: message.content });

      await message.channel.sendTyping();
      const reply = await chat(channelHistory);

      channelHistory.push({ role: "assistant", content: reply });
      if (channelHistory.length > 10) channelHistory.shift();
      memory.set(message.channelId, channelHistory);

      await message.reply(reply);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => processingMessages.delete(message.id), 5000);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
