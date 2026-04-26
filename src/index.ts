import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import * as dotenv from 'dotenv';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import { chat } from './ai.js'; // تأكد أن ملف الـ AI اسمه ai.ts داخل مجلد src

dotenv.config();

const app = express();
app.get('/', (req, res) => res.send('Toriel is Chilling!'));
app.listen(process.env.PORT || 10000, '0.0.0.0');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel],
});

// حالة الوجود في الروم
let isInVoice = false;

client.once('ready', () => {
    console.log(`✅ ${client.user?.tag} is online and ready!`);
});

// نظام مراقبة الروم (يطلع لو فضي)
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

  // أوامر الدخول والخروج
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
      return message.reply("I'm in! Let's hang out. ✨");
    }
  }

  if (content === '/leave') {
    getVoiceConnection(message.guildId!)?.destroy();
    isInVoice = false;
    return message.reply("See ya! 👋");
  }

  // نظام الردود باستخدام كود الـ AI "الرهيب" حقك
  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();

      // نرسل السياق الصوتي داخل الهيستوري بشكل مخفي
      const voiceContext = isInVoice 
        ? "[Note: You are currently in a voice channel with Casper__1]" 
        : "[Note: You are in text chat]";

      try {
          const reply = await chat([
            { role: "system", content: voiceContext },
            { role: "user", content: message.content }
          ]);
          await message.reply(reply);
      } catch (err) {
          console.error("AI Error:", err);
      }
  }
});

client.login(process.env.DISCORD_TOKEN);
