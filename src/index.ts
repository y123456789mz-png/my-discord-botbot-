import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import * as dotenv from 'dotenv';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import { chat } from './ai.js'; 

dotenv.config();

const app = express();
app.get('/', (req, res) => res.send('Toriel is finally awake! ✨'));
app.listen(process.env.PORT || 10000, '0.0.0.0');

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
    console.log(`✅ ${client.user?.tag} IS ONLINE!`);
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
      });
      isInVoice = true;
      return message.reply("توريال انضمت للروم! ✨");
    }
  }

  if (message.content === '/leave') {
    getVoiceConnection(message.guildId!)?.destroy();
    isInVoice = false;
    return message.reply("مع السلامة! 👋");
  }

  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();
      try {
          const reply = await chat([{ role: "user", content: message.content }]);
          await message.reply(reply);
      } catch (err) {
          console.error("AI Error:", err);
      }
  }
});

client.login(process.env.DISCORD_TOKEN);
