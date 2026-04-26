import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import * as dotenv from 'dotenv';
import { chat } from './ai.ts';

// تحميل الإعدادات
dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Toriel is Living! ✨'));
app.listen(port, '0.0.0.0', () => console.log(`✅ Web Server on port ${port}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// صيد أخطاء التشغيل
client.on('error', (err) => console.error('Discord Client Error:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled Promise Rejection:', err));

client.once('ready', () => {
    console.log(`✅ ${client.user?.tag} اشتغل أخيراً!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user!) || message.guild === null) {
      try {
          await message.channel.sendTyping();
          const reply = await chat([{ role: "user", content: message.content }]);
          await message.reply(reply);
      } catch (err) {
          console.error("AI Error:", err);
          await message.reply("عندي مشكلة في المخ (AI Error)، تأكد من مفتاح GROQ_API_KEY.");
      }
  }
});

// التأكد من وجود التوكن قبل التشغيل
if (!process.env.DISCORD_TOKEN) {
    console.error("❌ خطأ: مالقيت DISCORD_TOKEN في إعدادات ريندر!");
} else {
    client.login(process.env.DISCORD_TOKEN).catch(err => {
        console.error("❌ فشل تسجيل الدخول في ديسكورد:", err.message);
    });
}
