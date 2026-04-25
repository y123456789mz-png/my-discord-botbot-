import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('System Online'));
app.listen(port, '0.0.0.0');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel],
});

const memory = new Map<string, any[]>();
// نظام القفل بالبصمة
const processedIds = new Set<string>();

client.once('ready', () => console.log(`✅ ${client.user?.tag} is active`));

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const isMentioned = message.mentions.has(client.user!);
  const isDM = message.guild === null;

  if ((isMentioned || isDM) && !processedIds.has(message.id)) {
    processedIds.add(message.id); // قفل فوري

    try {
      let history = memory.get(message.channelId) || [];
      
      // إذا المحادثة علقت في التكرار، نصفر الذاكرة جزئياً
      if (history.length > 5 && history[history.length-1].content === history[history.length-3].content) {
        history = history.slice(-2); 
      }

      history.push({ role: "user", content: message.content });
      await message.channel.sendTyping();
      
      const reply = await chat(history);

      history.push({ role: "assistant", content: reply });
      if (history.length > 8) history.shift();
      memory.set(message.channelId, history);

      await message.reply(reply);
    } catch (e) {
      console.error(e);
    } finally {
      // تنظيف البصمات القديمة كل فترة
      setTimeout(() => processedIds.delete(message.id), 30000);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
