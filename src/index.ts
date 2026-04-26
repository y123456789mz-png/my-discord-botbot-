import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import * as dotenv from 'dotenv';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import Groq from "groq-sdk";

dotenv.config();

// --- قسم الـ AI (كودك الرهيب مدموج هنا) ---
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function torielChat(history: any[]): Promise<string> {
  let isEnglish = false;
  try {
    const lastUserMessage = history[history.length - 1].content;
    isEnglish = /[a-zA-Z]/.test(lastUserMessage);

    const systemInstruction = isEnglish 
      ? `You are Toriel, a female AI created by Casper__1. Sophisticated and polite.`
      : `أنتِ "توريال"، مساعدة ذكية ومبدعكِ هو Casper__1. استخدمي العربية الفصحى فقط.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [{ role: "system", content: systemInstruction }, ...history.slice(-10)],
      temperature: 0.3,
    });
    return completion.choices[0]?.message?.content || "أهلاً بك.";
  } catch (err) {
    return isEnglish ? "A technical hitch!" : "نعتذر عن وجود عطل فني.";
  }
}

// --- قسم البوت وسيرفر الويب ---
const app = express();
app.get('/', (req, res) => res.send('Toriel is Unified!'));
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

client.once('ready', () => console.log(`✅ ${client.user?.tag} IS ONLINE`));

client.on('voiceStateUpdate', (oldState, newState) => {
    const connection = getVoiceConnection(oldState.guild.id);
    if (connection) {
        const channel = oldState.guild.channels.cache.get(connection.joinConfig.channelId!) as any;
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
      });
      isInVoice = true;
      return message.reply("In the room! ✨");
    }
  }

  if (message.content === '/leave') {
    getVoiceConnection(message.guildId!)?.destroy();
    isInVoice = false;
    return message.reply("Bye! 👋");
  }

  if (message.mentions.has(client.user!) || message.guild === null) {
      await message.channel.sendTyping();
      const voiceNote = isInVoice ? "(Note: You are in a voice channel now)" : "";
      const reply = await torielChat([{ role: "user", content: voiceNote + message.content }]);
      await message.reply(reply);
  }
});

client.login(process.env.DISCORD_TOKEN);
