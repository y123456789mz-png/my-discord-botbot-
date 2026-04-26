import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus, 
    getVoiceConnection,
    NoSubscriberBehavior,
    StreamType
} from '@discordjs/voice';
import * as googleTTS from 'google-tts-api';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Tutorial is Live!'));
app.listen(port, '0.0.0.0', () => console.log(`Web server active on port ${port}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel],
});

const memory = new Map<string, any[]>();
const processing = new Set<string>();

client.once('ready', () => console.log(`✅ Logged in as ${client.user?.tag}`));

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  // 1️⃣ أمر الدخول
  if (content === '/join') {
    const channel = message.member?.voice.channel;
    if (channel) {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
        selfDeaf: false,
      });
      return message.reply("Sounds fun! Sure. 😉");
    }
    return message.reply("Get in a room first!");
  }

  // 2️⃣ أمر الخروج
  if (content === '/leave') {
    const connection = getVoiceConnection(message.guildId!);
    if (connection) {
      connection.destroy();
      return message.reply("See ya! 👋");
    }
  }

  // 3️⃣ أمر التحدث (النسخة المطورة والمضمونة)
  if (content.startsWith('/speak ')) {
    const channel = message.member?.voice.channel;
    if (channel) {
      const text = content.replace('/speak ', '').trim();
      if (!text) return;

      console.log(`جارِ محاولة نطق: ${text}`);

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
        selfDeaf: false,
      });

      const url = googleTTS.getAudioUrl(text, { 
        lang: 'ar', 
        slow: false, 
        host: 'https://translate.google.com' 
      });

      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play,
        },
      });

      // إنشاء المصدر الصوتي مع تحديد نوع التدفق
      const resource = createAudioResource(url, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
      });

      player.play(resource);
      connection.subscribe(player);

      // مراقبة الأخطاء والحالة
      player.on(AudioPlayerStatus.Playing, () => console.log("بدأ البث الصوتي بنجاح!"));
      player.on('error', error => {
        console.error(`خطأ في مشغل الصوت: ${error.message}`);
        message.channel.send("Sorry Casper, I'm having trouble speaking. Check the logs!");
      });

      return;
    }
  }

  // 4️⃣ نظام السوالف (فقط إذا منشنته)
  const isMentioned = message.mentions.has(client.user!);
  if ((isMentioned || message.guild === null) && !processing.has(message.id)) {
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
      setTimeout(() => processing.delete(message.id), 15000);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
