import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js';

dotenv.config();

const app = express();
app.get('/', (req, res) => res.send('Online'));
app.listen(process.env.PORT || 10000, '0.0.0.0');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel],
});

const memory = new Map<string, any[]>();
const processing = new Set<string>();

client.on('messageCreate', async (message) => {
  // تجاهل البوتات فوراً ومنع التكرار
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
      // تنظيف الـ ID بعد فترة كافية لضمان عدم التكرار
      setTimeout(() => processing.delete(message.id), 15000);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
