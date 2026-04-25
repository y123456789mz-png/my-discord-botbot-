import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js';

dotenv.config();

// --- حل مشكلة البورت في رندر (Render Port Fix) ---
const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('توريال في أتم الاستعداد!'));
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ السيرفر الوهمي شغال على بورت: ${port}`);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const memory = new Map<string, any[]>();
// قفل أمان لمنع الرد المكرر
const processing = new Set<string>();

client.once('ready', (c) => {
  console.log(`✅ البوت متصل الآن باسم: ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // 1. تجاهل رسائل البوتات (أهم شرط لمنع التكرار)
  if (message.author.bot) return;

  const isMentioned = message.mentions.has(client.user!);
  const isDM = message.guild === null;

  // 2. إذا تم منشنه أو كانت رسالة خاصة، ولم نكن نعالجها حالياً
  if ((isMentioned || isDM) && !processing.has(message.id)) {
    processing.add(message.id);

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
      console.error("خطأ:", error);
    } finally {
      // إزالة الرسالة من "قائمة المعالجة" بعد فترة بسيطة
      setTimeout(() => processing.delete(message.id), 10000);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
