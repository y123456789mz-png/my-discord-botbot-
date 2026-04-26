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

  // دخول الروم
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
  }

  // التحدث (النسخة الصارمة)
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

      try {
        // ننتظر الاتصال يصير Ready قبل ما نشغل أي شيء
        await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
        
        const url = googleTTS.getAudioUrl(text, { lang: 'ar', slow: false, host: 'https://translate.google.com' });
        const player = createAudioPlayer();
        const resource = createAudioResource(url, { inputType: StreamType.Arbitrary });

        player.play(resource);
        connection.subscribe(player);

        console.log(`[Audio] Speaking: ${text}`);
      } catch (error) {
        console.error("Voice Connection Error:", error);
      }
      return;
    }
  }

  if (content === '/leave') {
    getVoiceConnection(message.guildId!)?.destroy();
    return message.reply("See ya! 👋");
  }

  // سوالف الذكاء الاصطناعي
  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();
      const reply = await chat([{role: "user", content: message.content}]);
      await message.reply(reply);
  }
});

client.login(process.env.DISCORD_TOKEN);
