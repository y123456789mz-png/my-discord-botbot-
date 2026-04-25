import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js';

dotenv.config();

// --- تحسين الربط مع رندر لمنع الإغلاق التلقائي ---
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('توريال في حالة يقظة تامة!'));

// إضافة '0.0.0.0' ضروري جداً ليرى رندر أن السيرفر متاح خارجياً
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ الخادم الوهمي نشط على المنفذ: ${port}`);
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
const processing = new Set<string>();

client.once('ready', (c) => {
  console.log(`✅ البوت متصل ومستعد: ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || processing.has(message.id)) return;

  const isMentioned = message.mentions.has(client.user!);
  const isDM = message.guild === null;

  if (isMentioned || isDM) {
    processing.add(message.id);
    try {
      let history = memory.get(message.channelId) || [];
      history.push({ role: "user", content: message.content });

      await message.channel.sendTyping();
      const reply = await chat(history);

      history.push({ role: "assistant", content: reply });
      if (history.length > 6) history.shift();
      memory.set(message.channelId, history);

      await message.reply(reply);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => processing.delete(message.id), 15000);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
