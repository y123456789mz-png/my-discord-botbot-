import { Client, GatewayIntentBits } from 'discord.js';
import { chat } from './ai';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on('ready', () => {
  console.log(`تم تشغيل البوت بنجاح باسم: ${client.user?.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // البوت بيرد على أي رسالة توصله
  try {
    const response = await chat([{ role: "user", content: message.content }]);
    await message.reply(response);
  } catch (error) {
    console.error(error);
    await message.reply("فيه مشكلة فنية بالكود الجديد!");
  }
});

// تأكد إنك حاط التوكن الجديد في Render في المتغير DISCORD_BOT_TOKEN
client.login(process.env.DISCORD_BOT_TOKEN);

// تشغيل سيرفر بسيط عشان رندر ما يقفل الخدمة
import http from 'http';
http.createServer((req, res) => { res.write('OK'); res.end(); }).listen(10000);
