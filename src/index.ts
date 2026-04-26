import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';

dotenv.config();

// إعداد السيرفر عشان Render ما يطفي
const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Toriel is in the house!'));
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

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);
    client.user?.setActivity('the vibes', { type: 3 }); // Watching
});

// نظام "الانسحاب التكتيكي": إذا الروم فضي، تطلع
client.on('voiceStateUpdate', (oldState, newState) => {
    const connection = getVoiceConnection(oldState.guild.id);
    if (connection) {
        const channelId = connection.joinConfig.channelId;
        const channel = oldState.guild.channels.cache.get(channelId!) as any;

        // إذا ما بقى في الروم إلا البوت (أو أقل)
        if (channel && channel.members.size <= 1) {
            console.log("Room is empty, Toriel is heading out.");
            connection.destroy();
        }
    }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();

  // 1. أمر الدخول /join
  if (content === '/join') {
    const channel = message.member?.voice.channel;
    if (channel) {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
        selfDeaf: false,
      });
      client.user?.setActivity('with Casper in Voice', { type: 0 }); // Playing
      return message.reply("Alright! I'm in the room. Let's hang out. ✨");
    }
    return message.reply("You need to be in a voice channel first!");
  }

  // 2. أمر الخروج /leave
  if (content === '/leave') {
    const connection = getVoiceConnection(message.guildId!);
    if (connection) {
      connection.destroy();
      client.user?.setActivity('the vibes', { type: 3 }); 
      return message.reply("Catch you later! 👋");
    }
  }

  // 3. نظام السوالف (بالمنشن)
  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();

      // التحقق من حالة الروم عشان "توريال" تفهم وين هي
      const connection = getVoiceConnection(message.guildId!);
      let contextNote = "";

      if (connection) {
          // هذي الملاحظة تروح للذكاء الاصطناعي وما تظهر للمستخدم
          contextNote = "[System Info: You are currently in a voice channel with the user. You are just 'chilling' and hanging out. Acknowledge this if relevant.]\n";
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
