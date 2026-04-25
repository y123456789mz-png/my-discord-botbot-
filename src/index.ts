import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js';

dotenv.config();

// سيرفر وهمي لفتح المنفذ (Port) عشان رندر ما يطفي البوت
const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('توريال بأفضل حال!'));
app.listen(port, '0.0.0.0', () => console.log(`✅ السيرفر الوهمي شغال: ${port}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const memory = new Map<string, any[]>();
// نظام قفل صارم جداً لمنع التكرار
const activeMessages = new Set<string>();

client.once('ready', (c) => {
  console.log(`✅ البوت متصل الآن: ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // تجاهل البوتات فوراً
  if (message.author.bot) return;

  const isMentioned = message.mentions.has(client.user!);
  const isDM = message.guild === null;

  // فحص إذا كانت الرسالة قيد المعالجة حالياً لمنع الرد المزدوج
  if ((isMentioned || isDM) && !activeMessages.has(message.id)) {
    activeMessages.add(message.id);

    try {
      let channelHistory = memory.get(message.channelId) || [];
      channelHistory.push({ role: "user", content: message.content });

      // البدء في كتابة رد (Typing...)
      await message.channel.sendTyping();
      
      const reply = await chat(channelHistory);

      channelHistory.push({ role: "assistant", content: reply });
      if (channelHistory.length > 10) channelHistory.shift();
      memory.set(message.channelId, channelHistory);

      await message.reply(reply);
    } catch (error) {
      console.error("خطأ في المعالجة:", error);
    } finally {
      // إزالة الرسالة من القفل بعد 10 ثوانٍ لضمان عدم التكرار
      setTimeout(() => activeMessages.delete(message.id), 10000);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
