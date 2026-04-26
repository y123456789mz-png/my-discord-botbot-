import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import * as dotenv from 'dotenv';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import { chat } from './ai.js'; 

dotenv.config();

const app = express();
app.get('/', (req, res) => res.send('Toriel is Live!'));
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

let isInVoice = false;

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
      return message.reply("I'm in! ✨");
    }
  }

  if (message.content === '/leave') {
    getVoiceConnection(message.guildId!)?.destroy();
    isInVoice = false;
    return message.reply("Bye! 👋");
  }

  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();
      
      const voiceNote = isInVoice ? "(Note: You are currently with the user in a voice channel)" : "";
      
      try {
          const reply = await chat([
            { role: "user", content: voiceNote + message.content }
          ]);
          await message.reply(reply);
      } catch (err) {
          console.error(err);
      }
  }
});

client.login(process.env.DISCORD_TOKEN);
