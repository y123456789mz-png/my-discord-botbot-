import { Client, GatewayIntentBits, Partials } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { chat } from './ai.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import * as googleTTS from 'google-tts-api';

dotenv.config();

// --- خادم الويب للحفاظ على نشاط البوت في ريندر ---
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('توريال في حالة يقظة تامة!'));

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ الخادم الوهمي نشط على المنفذ: ${port}`);
});

// --- إعداد العميل مع صلاحيات الصوت والرسائل ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates, // ضروري للصوت
  ],
  partials: [Partials.Channel],
});

const memory = new Map<string, any[]>();
const processing = new Set<string>();

client.once('ready', (c) => {
  console.log(`✅ البوت متصل ومستعد: ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || processing.has(message.id)) return;

  // --- قسم الأوامر الصوتية (!speak) ---
  if (message.content.startsWith('!speak')) {
    const channel = message.member?.voice.channel;
    
    if (channel) {
      // استخراج النص بعد كلمة !speak
      const textToSay = message.content.replace('!speak', '').trim() || "أهلاً بك يا كاسبر، أنا توريال";
      
      try {
        const connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator as any,
        });

        const url = googleTTS.getAudioUrl(textToSay, {
          lang: 'ar',
          slow: false,
          host: 'https://translate.google.com',
        });

        const player = createAudioPlayer();
        const resource = createAudioResource(url);
        
        player.play(resource);
        connection.subscribe(player);
        
        await message.reply("أبشر، أنا في الروم الآن وقاعدة أتكلم! 🎙️✨");
      } catch (error) {
        console.error("فشل في تشغيل الصوت:", error);
        await message.reply("حصلت مشكلة وأنا أحاول أتكلم، تأكد إني عندي صلاحيات في الروم.");
      }
      return; 
    } else {
      await message.reply("ادخل روم صوتي أول يا وحش عشان أجيك!");
      return;
    }
  }

  // --- قسم الذكاء الاصطناعي (ردود توريال العادية) ---
  const isMentioned = message.mentions.has(client.user!);
  const isDM = message.guild === null;

  if (isMentioned || isDM) {
    processing.add(message.id);
    try {
      let history = memory.get(message.channelId) || [];
      history.push({ role: "user", content: message.content });

      await message.channel.sendTyping();
      const reply = await chat(history);

      history.push({ role: "assistant", content: reply });
      if (history.length > 6) history.shift();
      memory.set(message.channelId, history);

      await message.reply(reply);
    } catch (e) {
      console.error("خطأ في معالجة الذكاء الاصطناعي:", e);
    } finally {
      setTimeout(() => processing.delete(message.id), 15000);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
