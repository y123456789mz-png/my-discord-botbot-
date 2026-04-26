import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import * as dotenv from 'dotenv';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import { chat } from './ai.js'; // هذي هي التكة اللي تخليه يشتغل في ريندر

dotenv.config();

const app = express();
app.get('/', (req, res) => res.send('Toriel is Chilling!'));
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

client.once('ready', () => {
    console.log(`✅ ${client.user?.tag} is online!`);
});

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
      isInVoice = true;
      return message.reply("I'm in! Let's hang out. ✨");
    }
    return message.reply("Join a voice room first!");
  }

  if (content === '/leave') {
    getVoiceConnection(message.guildId!)?.destroy();
    isInVoice = false;
    return message.reply("See ya! 👋");
  }

  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();
      let context = "[System: Reply in the same language as the user. ";
      context += isInVoice ? "You are in a voice channel together.]\n" : "You are not in a voice channel.]\n";

      try {
          const reply = await chat([{ role: "user", content: context + message.content }]);
          await message.reply(reply);
      } catch (err) {
          console.error("Chat Error:", err);
      }
  }
});

client.login(process.env.DISCORD_TOKEN);
