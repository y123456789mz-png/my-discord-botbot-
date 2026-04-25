import { Client, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import { chat } from './ai.js'; // تأكد إن ملف الـ AI اسمه ai.ts

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// مصفوفة بسيطة لحفظ آخر 10 رسائل لكل قناة (ذاكرة مؤقتة)
const memory = new Map<string, any[]>();

client.once('ready', () => {
  console.log(`✅ توريال فزت وشغالة الحين باسم: ${client.user?.tag}`);
});

client.on('messageCreate', async (message) => {
  // تجاهل رسائل البوتات عشان ما يرد على نفسه
  if (message.author.bot) return;

  // البوت يرد بس إذا أحد منشنه أو كتب رسالة خاصة
  if (message.mentions.has(client.user!) || message.guild === null) {
    try {
      // جلب الذاكرة الخاصة بالقناة
      let channelHistory = memory.get(message.channelId) || [];
      
      // إضافة رسالة المستخدم للذاكرة
      channelHistory.push({ role: "user", content: message.content });

      // البدء في التفكير (Show typing)
      await message.channel.sendTyping();

      // إرسال الطلب لملف الـ AI
      const reply = await chat(channelHistory);

      // إضافة رد البوت للذاكرة
      channelHistory.push({ role: "assistant", content: reply });

      // تنظيف الذاكرة (نخلي بس آخر 10 رسائل)
      if (channelHistory.length > 10) channelHistory.shift();
      memory.set(message.channelId, channelHistory);

      // إرسال الرد في ديسكورد
      await message.reply(reply);

    } catch (error) {
      console.error("Error:", error);
      await message.reply("يا كاسبر، السيرفر فيه بلا، عيا يرد علي!");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
