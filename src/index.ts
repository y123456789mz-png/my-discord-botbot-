import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import * as dotenv from 'dotenv';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import { chat } from './ai.js'; 

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 10000;

app.get('/', (_req, res) => {
    res.send('Toriel is finally awake and stable! ✨');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Web server is running on port ${port}`);
});

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

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '/join') {
    const channel = message.member?.voice.channel;
    if (channel) {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
        selfDeaf: false,
      });
      isInVoice = true;
      return message.reply("أبشر! دخلت الروم الصوتي. ✨");
    }
  }

  if (message.content === '/leave') {
    getVoiceConnection(message.guildId!)?.destroy();
    isInVoice = false;
    return message.reply("في أمان الله! 👋");
  }

  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();
      try {
          const reply = await chat([{ role: "user", content: message.content }]);
          await message.reply(reply);
      } catch (err) {
          console.error("Chat Error:", err);
      }
  }
});

client.login(process.env.DISCORD_TOKEN);
