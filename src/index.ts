import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { chat } from './ai.js';

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const memory = new Map<string, any[]>();
// نظام لمنع الرد المكرر
const processingMessages = new Set();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // إذا البوت تم منشنه أو كانت رسالة خاصة
  const isMentioned = message.mentions.has(client.user!);
  const isDM = message.guild === null;

  if ((isMentioned || isDM) && !processingMessages.has(message.id)) {
    processingMessages.add(message.id); // سجل الرسالة كأنها تحت المعالجة

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
      // احذفها من القائمة بعد 5 ثواني عشان ما يتراكم السيت
      setTimeout(() => processingMessages.delete(message.id), 5000);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
