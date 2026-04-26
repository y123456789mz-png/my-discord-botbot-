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
// استيراد المسار الحقيقي للمكتبة
import ffmpeg from 'ffmpeg-static';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Toriel is here!'));
app.listen(port, '0.0.0.0', () => console.log(`Server on ${port}`));

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
  if (message.author.bot) return;
  const content = message.content.trim();

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

  if (content === '/leave') {
    const connection = getVoiceConnection(message.guildId!);
    if (connection) {
      connection.destroy();
      return message.reply("See ya! 👋");
    }
  }

  if (content.startsWith('/speak ')) {
    const channel = message.member?.voice.channel;
    if (channel) {
      const text = content.replace('/speak ', '').trim();
      if (!text) return;

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
        selfDeaf: false,
      });

      const url = googleTTS.getAudioUrl(text, { lang: 'ar', slow: false, host: 'https://translate.google.com' });
      
      const player = createAudioPlayer();
      
      // الضربة القاضية: إجبار المشغل على استخدام FFmpeg من المكتبة
      const resource = createAudioResource(url, {
          inputType: StreamType.Arbitrary,
          inlineVolume: true
      });

      connection.subscribe(player);
      player.play(resource);

      player.on(AudioPlayerStatus.Playing, () => console.log("بدأ الصوت الحين!"));
      player.on('error', error => {
        console.error("Audio Error Detail:", error);
      });

      return;
    }
  }

  const isMentioned = message.mentions.has(client.user!);
  if (isMentioned || message.guild === null) {
      await message.channel.sendTyping();
      const reply = await chat([{role: "user", content: message.content}]);
      await message.reply(reply);
  }
});

client.login(process.env.DISCORD_TOKEN);
