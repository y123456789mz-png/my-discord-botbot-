import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Toriel is watching the room!'));
app.listen(port, '0.0.0.0', () => console.log(`Server is up on ${port}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates, // ضروري لمراقبة الروم
  ],
  partials: [Partials.Channel],
});

client.once('ready', () => console.log(`✅ ${client.user?.tag} is ready!`));

// نظام مراقبة الروم: إذا فضي الروم تطلع
client.on('voiceStateUpdate', (oldState, newState) => {
    const connection = getVoiceConnection(oldState.guild.id);
    
    // إذا البوت متصل بروم صوته أصلاً
    if (connection) {
        const channelId = connection.joinConfig.channelId;
        const channel = oldState.guild.channels.cache.get(channelId!) as any;

        // إذا الروم صار فيه شخص واحد (اللي هو البوت نفسه) أو فضي تماماً
        if (channel && channel.members.size <= 1) {
            console.log("الروم فضي.. توريال سحبت نفسها.");
            connection.destroy();
        }
    }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const content = message.content.trim();

  // دخول الروم
  if (content === '/join') {
    const channel = message.member?.voice.channel;
    if (channel) {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
        selfDeaf: false,
      });
      return message.reply("I'm here to keep you company. I'll leave when everyone else does. 😊");
    }
    return message.reply("Get in a room first!");
  }

  // خروج يدوي
  if (content === '/leave') {
    const connection = getVoiceConnection(message.guildId!);
    if (connection) {
      connection.destroy();
      return message.reply("Bye for now! 👋");
    }
  }

  // السوالف الكتابية
  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();
      const reply = await chat([{role: "user", content: message.content}]);
      await message.reply(reply);
  }
});

client.login(process.env.DISCORD_TOKEN);
