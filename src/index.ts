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
// إضافة مكتبة التشفير ضروري جداً
import libsodium from 'libsodium-wrappers';

dotenv.config();

// تفعيل التشفير الصوتي قبل تشغيل البوت
async function init() {
    await libsodium.ready;
    console.log("✅ Audio Encryption Ready");
}
init();

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

  if (content === '/join') {
    const channel = message.member?.voice.channel;
    if (channel) {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
        selfDeaf: false,
      });
      return message.reply("I'm in! 😉");
    }
  }

  if (content.startsWith('/speak ')) {
    const channel = message.member?.voice.channel;
    if (!channel) return message.reply("Join a room first!");

    const text = content.replace('/speak ', '').trim();
    if (!text) return;

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator as any,
      selfDeaf: false,
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
      
      const url = googleTTS.getAudioUrl(text, { lang: 'ar', slow: false, host: 'https://translate.google.com' });
      const player = createAudioPlayer();
      // استخدام OggOpus كخيار بديل إذا فشل العادي
      const resource = createAudioResource(url, { inputType: StreamType.Arbitrary });

      connection.subscribe(player);
      player.play(resource);

      player.on(AudioPlayerStatus.Playing, () => console.log(`[Audio] Playing: ${text}`));
      player.on('error', err => console.error("Audio Player Error:", err));

    } catch (error) {
      console.error("Voice Error:", error);
    }
  }

  if (content === '/leave') {
    getVoiceConnection(message.guildId!)?.destroy();
    return message.reply("See ya! 👋");
  }

  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();
      const reply = await chat([{role: "user", content: message.content}]);
      await message.reply(reply);
  }
});

client.login(process.env.DISCORD_TOKEN);
