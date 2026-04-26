import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import * as dotenv from 'dotenv';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
// ملاحظة: استخدام './ai.js' ضروري جداً هنا حتى لو كان الملف .ts
import { chat } from './ai.js'; 

dotenv.config();

// سيرفر الويب لضمان استقرار البوت على Render
const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Toriel is back and running! ✨'));
app.listen(port, '0.0.0.0', () => console.log(`Server listening on port ${port}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

let isInVoice = false;

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);
});

// نظام الخروج التلقائي إذا فضيت الغرفة
client.on('voiceStateUpdate', (oldState, newState) => {
    const connection = getVoiceConnection(oldState.guild.id);
    if (connection) {
        const channelId = connection.joinConfig.channelId;
        const channel = oldState.guild.channels.cache.get(channelId!) as any;
        if (channel && channel.members.size <= 1) {
            connection.destroy();
            isInVoice = false;
        }
    }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  // أوامر التحكم في الصوت
  if (content === '/join') {
    const channel = message.member?.voice.channel;
    if (channel) {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
        selfDeaf: false,
      });
      isInVoice = true;
      return message.reply("أبشر! أنا معك الآن في الروم الصوتي. ✨");
    }
    return message.reply("ادخل روم صوتي أولاً يا بطل!");
  }

  if (content === '/leave') {
    getVoiceConnection(message.guildId!)?.destroy();
    isInVoice = false;
    return message.reply("في أمان الله! 👋");
  }

  // الرد على المنشن أو الرسائل الخاصة باستخدام كود الـ AI حقك
  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();
      
      const voiceContext = isInVoice ? "[ملاحظة: أنتِ الآن في روم صوتي مع المستخدم]" : "";
      
      try {
          const reply = await chat([
            { role: "user", content: voiceContext + message.content }
          ]);
          await message.reply(reply);
      } catch (err) {
          console.error("AI Chat Error:", err);
      }
  }
});

client.login(process.env.DISCORD_TOKEN);
