import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('توريال تعمل بكفاءة!'));
app.listen(port, '0.0.0.0', () => console.log(`✅ Port active: ${port}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const memory = new Map<string, any[]>();
// قفل لمنع التكرار
const processedMessages = new Set<string>();

client.once('ready', (c) => {
  console.log(`✅ المتصل الآن: ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const isMentioned = message.mentions.has(client.user!);
  const isDM = message.guild === null;

  // التحقق من القفل لمنع الرد المزدوج
  if ((isMentioned || isDM) && !processedMessages.has(message.id)) {
    processedMessages.add(message.id);

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
      console.error("Execution error:", error);
    } finally {
      // إبقاء الرسالة في القفل لمدة دقيقة لضمان عدم التكرار
      setTimeout(() => processedMessages.delete(message.id), 60000);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
