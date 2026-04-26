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
    AudioPlayerStatus,
    entersState,
    VoiceConnectionStatus
} from '@discordjs/voice';
import * as googleTTS from 'google-tts-api';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Toriel is Ready!'));
app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));

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

  // أمر الدخول
  if (content === '/join') {
    const channel = message.member?.voice.channel;
    if (channel) {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
        selfDeaf: false,
        selfMute: false,
      });
      return message.reply("Sounds fun! I'm in. 😉");
    }
    return message.reply("Get in a room first!");
  }

  // أمر التحدث (المعدل والمضمون)
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
        selfMute: false,
      });

      try {
        // ننتظر الاتصال يصير Ready عشان نضمن إن الأنابيب الصوتية شبكت
        await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
        
        const url = googleTTS.getAudioUrl(text, { lang: 'ar', slow: false, host: 'https://translate.google.com' });
        const player = createAudioPlayer();
        const resource = createAudioResource(url, { inputType: StreamType.Arbitrary });

        connection.subscribe(player);
        player.play(resource);

        player.on(AudioPlayerStatus.Playing, () => console.log(`[Audio] Speaking now: ${text}`));
        player.on('error', error => console.error("[Audio Error]:", error.message));

      } catch (error) {
        console.error("Voice Error:", error);
      }
      return;
    }
    return message.reply("I need to be in a voice channel to speak!");
  }

  // أمر الخروج
  if (content === '/leave') {
    getVoiceConnection(message.guildId!)?.destroy();
    return message.reply("See ya! 👋");
  }

  // نظام السوالف العادي
  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();
      const reply = await chat([{role: "user", content: message.content}]);
      await message.reply(reply);
  }
});

client.login(process.env.DISCORD_TOKEN);
