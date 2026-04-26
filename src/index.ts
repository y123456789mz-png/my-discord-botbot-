import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js'; 
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';

dotenv.config();

// سيرفر صغير عشان Render ما يطفي البوت
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
    console.log(`✅ ${client.user?.tag} is online and ready!`);
});

// نظام ذكاء الروم: تطلع لو فضي وتصفر ذاكرتها
client.on('voiceStateUpdate', (oldState, newState) => {
    const connection = getVoiceConnection(oldState.guild.id);
    if (connection) {
        const channelId = connection.joinConfig.channelId;
        const channel = oldState.guild.channels.cache.get(channelId!) as any;

        if (channel && channel.members.size <= 1) {
            console.log("Empty room. Goodbye!");
            connection.destroy();
            isInVoice = false;
        }
    }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  // أوامر التحكم
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
    return message.reply("Join a voice room first, Casper!");
  }

  if (content === '/leave') {
    getVoiceConnection(message.guildId!)?.destroy();
    isInVoice = false;
    return message.reply("Catch you later! 👋");
  }

  // نظام الردود (عربي/إنجليزي + وعي بالروم)
  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();

      let context = "[System: Reply in the same language as the user. ";
      context += isInVoice ? "You are currently hanging out with them in a voice channel.]\n" : "You are not in a voice channel.]\n";

      try {
          const reply = await chat([{ role: "user", content: context + message.content }]);
          await message.reply(reply);
      } catch (err) {
          console.error("Chat Error:", err);
      }
  }
});

client.login(process.env.DISCORD_TOKEN);
