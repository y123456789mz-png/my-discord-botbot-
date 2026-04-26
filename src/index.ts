import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    getVoiceConnection,
    StreamType,
    AudioPlayerStatus
} from '@discordjs/voice';
import * as googleTTS from 'google-tts-api';

dotenv.config();

// إعداد خادم الويب
const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Tutorial is Ready!'));
app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));

// إعداد البوت
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel],
});

client.once('ready', () => console.log(`✅ Logged in as ${client.user?.tag}`));

client.on('messageCreate', async (message) => {
  // تجاهل رسائل البوتات
  if (message.author.bot) return;

  const content = message.content.trim();

  // 1. أمر الدخول /join
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
    return message.reply("Get in a room first, Casper!");
  }

  // 2. أمر النطق /speak
  if (content.startsWith('/speak ')) {
    const channel = message.member?.voice.channel;
    if (channel) {
      const textToSay = content.replace('/speak ', '').trim();
      if (!textToSay) return message.reply("Write something after /speak!");

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
        selfDeaf: false,
      });

      const url = googleTTS.getAudioUrl(textToSay, { 
        lang: 'ar', 
        slow: false, 
        host: 'https://translate.google.com' 
      });

      const player = createAudioPlayer();
      const resource = createAudioResource(url, { inputType: StreamType.Arbitrary });

      connection.subscribe(player);
      player.play(resource);
      
      console.log(`[Audio] Speaking: ${textToSay}`);
      return;
    }
    return message.reply("I need to be in a voice channel to speak!");
  }

  // 3. أمر الخروج /leave
  if (content === '/leave') {
    const connection = getVoiceConnection(message.guildId!);
    if (connection) {
      connection.destroy();
      return message.reply("See ya! 👋");
    }
    return message.reply("I'm not in any voice channel.");
  }

  // 4. نظام السوالف (توريال ترد بالذكاء الاصطناعي عند المنشن)
  if (message.mentions.has(client.user!) || message.guild === null) {
      try {
          await message.channel.sendTyping();
          const reply = await chat([{role: "user", content: message.content}]);
          await message.reply(reply);
      } catch (err) {
          console.error("AI Chat Error:", err);
      }
  }
});

client.login(process.env.DISCORD_TOKEN);
