import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js'; // تأكد إن ملف ai.js موجود في نفس مجلد src
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Toriel is Live!'));
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

let isInVoice = false;

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);
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
      return message.reply("I'm in! I'll match your language. ✨");
    }
  }

  if (content === '/leave') {
    getVoiceConnection(message.guildId!)?.destroy();
    isInVoice = false;
    return message.reply("See ya! 👋");
  }

  if (message.mentions.has(client.user!) || message.guild === null) {
      try {
          await message.channel.sendTyping();
          let contextNote = "[System: Respond in the SAME language the user uses. ";
          contextNote += isInVoice ? "You are in a voice channel.]\n" : "You are not in a voice channel.]\n";

          const reply = await chat([{ role: "user", content: contextNote + message.content }]);
          await message.reply(reply);
      } catch (err) {
          console.error("AI Error:", err);
      }
  }
});

client.login(process.env.DISCORD_TOKEN);
