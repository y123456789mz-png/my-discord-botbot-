import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import * as dotenv from 'dotenv';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
// ملاحظة: الامتداد .js ضروري هنا عشان الـ TypeScript يحوله صح
import { chat } from './ai.js'; 

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Toriel is online and stable! ✨'));
app.listen(port, '0.0.0.0', () => console.log(`Web server running on port ${port}`));

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

// نظام الخروج التلقائي
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
      return message.reply("أبشر! دخلت الروم الصوتي معك. ✨");
    }
    return message.reply("لازم تكون في روم صوتي أولاً!");
  }

  if (content === '/leave') {
    getVoiceConnection(message.guildId!)?.destroy();
    isInVoice = false;
    return message.reply("مع السلامة، أشوفك على خير! 👋");
  }

  // الرد على المنشن أو الخاص
  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();
      
      const voiceNote = isInVoice ? "[ملاحظة للنظام: أنتِ الآن تتحدثين في قناة صوتية]" : "";
      
      try {
          const reply = await chat([
            { role: "user", content: voiceNote + message.content }
          ]);
          await message.reply(reply);
      } catch (err) {
          console.error("AI Error:", err);
          await message.reply("نعتذر، واجهت مشكلة في معالجة طلبك.");
      }
  }
});

client.login(process.env.DISCORD_TOKEN);
