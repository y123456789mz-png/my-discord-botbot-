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
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const memory = new Map<string, any[]>();
const processedIds = new Set<string>();

client.once('ready', () => console.log(`✅ ${client.user?.tag} Ready`));

client.on('messageCreate', async (message) => {
  // 1. أهم شرط: إذا كانت الرسالة من بوت (أو من توريال نفسها) تجاهلها فوراً
  if (message.author.bot) return;

  const isMentioned = message.mentions.has(client.user!);
  const isDM = message.guild === null;

  // 2. معالجة الرسالة فقط إذا تم منشن البوت ولم يتم معالجتها من قبل
  if ((isMentioned || isDM) && !processedIds.has(message.id)) {
    processedIds.add(message.id);

    try {
      let history = memory.get(message.channelId) || [];
      
      // مسح الذاكرة إذا بدأت بالتكرار الممل
      if (history.length > 4 && history[history.length-1].content === history[history.length-3].content) {
        history = []; 
      }

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
      // تنظيف سجل المعالجة بعد 30 ثانية
      setTimeout(() => processedIds.delete(message.id), 30000);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
