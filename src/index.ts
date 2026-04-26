import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } from '@discordjs/voice';
import * as googleTTS from 'google-tts-api';

dotenv.config();

// --- خادم الويب للحفاظ على نشاط البوت ---
const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('توريال في حالة يقظة تامة!'));
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ الخادم الوهمي نشط على المنفذ: ${port}`);
});

// --- إعداد العميل ---
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

client.once('ready', (c) => {
  console.log(`✅ البوت متصل ومستعد: ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  // 1️⃣ أمر الدخول /join
  if (content === '/join') {
    const channel = message.member?.voice.channel;
    if (channel) {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
      });
      return message.reply("أبشر، دخلت الروم! 🫡");
    }
    return message.reply("ادخل روم صوتي أول يا كاسبر!");
  }

  // 2️⃣ أمر الخروج /leave
  if (content === '/leave') {
    const connection = getVoiceConnection(message.guildId!);
    if (connection) {
      connection.destroy();
      return message.reply("يلا، استودعتكم الله! 👋");
    }
    return message.reply("أنا أصلاً مو في الروم!");
  }

  // 3️⃣ أمر التحدث /speak
  if (content.startsWith('/speak ')) {
    const channel = message.member?.voice.channel;
    if (channel) {
      const textToSay = content.replace('/speak ', '').trim();
      if (!textToSay) return message.reply("اكتب وش تبيني أقول بعد /speak");

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
      });

      const url = googleTTS.getAudioUrl(textToSay, {
        lang: 'ar',
        slow: false,
        host: 'https://translate.google.com',
      });

      const player = createAudioPlayer();
      player.play(createAudioResource(url));
      connection.subscribe(player);
      return; // يتكلم بدون ما يرسل رد نصي يزعجك
    }
    return message.reply("لازم تكون في روم صوتي عشان أتكلم!");
  }

  // 4️⃣ نظام السوالف (فقط إذا منشنته أو في الخاص)
  const isMentioned = message.mentions.has(client.user!);
  const isDM = message.guild === null;

  if ((isMentioned || isDM) && !processing.has(message.id)) {
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
