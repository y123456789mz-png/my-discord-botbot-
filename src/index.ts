import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Toriel is Adaptive!'));
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

// متغير لحفظ حالة الروم
let isInVoice = false;

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);
});

// نظام مراقبة الروم والنسيان
client.on('voiceStateUpdate', (oldState, newState) => {
    const connection = getVoiceConnection(oldState.guild.id);
    if (connection) {
        const channelId = connection.joinConfig.channelId;
        const channel = oldState.guild.channels.cache.get(channelId!) as any;

        if (channel && channel.members.size <= 1) {
            console.log("Room empty. Leaving and resetting context...");
            connection.destroy();
            isInVoice = false; // هنا تنسى إنها كانت في الروم
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
      isInVoice = true; // الحين عرفت إنها دخلت
      return message.reply("I'm in! I'll match your language and vibe. ✨");
    }
    return message.reply("Join a voice channel first!");
  }

  if (content === '/leave') {
    const connection = getVoiceConnection(message.guildId!);
    if (connection) {
      connection.destroy();
      isInVoice = false; // تصفر الذاكرة يدوياً
      return message.reply("See ya! 👋");
    }
  }

  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();

      // إعداد الملاحظة المخفية بناءً على الحالة
      let contextNote = "[System: Respond in the SAME language the user uses. ";
      if (isInVoice) {
          contextNote += "You are currently hanging out in a voice channel. Acknowledge this naturally if asked.]\n";
      } else {
          contextNote += "You are NOT in a voice channel right now.]\n";
      }

      try {
          const reply = await chat([{ 
              role: "user", 
              content: contextNote + message.content 
          }]);
          await message.reply(reply);
      } catch (err) {
          console.error("AI Error:", err);
      }
  }
});

client.login(process.env.DISCORD_TOKEN);
