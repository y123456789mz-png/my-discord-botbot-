import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import * as dotenv from 'dotenv';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
// حذفنا الـ .js والـ .ts .. كذا tsx بيفهمها صح
import { chat } from './ai'; 

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Toriel is Living! ✨'));
app.listen(port, '0.0.0.0', () => console.log(`Server running on ${port}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once('ready', () => {
    console.log(`✅ ${client.user?.tag} is online and ready!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

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
