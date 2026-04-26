import { Client, GatewayIntentBits, Events } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import { chat } from './bot.ts'; 
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// سيرفر صغير عشان ريندر ما يعطي أخطاء Port
http.createServer((req, res) => {
    res.write('Toriel is Live!');
    res.end();
}).listen(10000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

// عند التشغيل
client.once(Events.ClientReady, (c) => {
    console.log(`✅ ${c.user.tag} is active and ready.`);
});

// ميزة الخروج التلقائي إذا فضي الروم
client.on(Events.VoiceStateUpdate, (oldState) => {
    const connection = getVoiceConnection(oldState.guild.id);
    if (connection) {
        const channel = oldState.channel;
        // إذا لم يتبقَ أحد غير البوتات، اخرج فوراً
        if (channel && channel.members.filter(m => !m.user.bot).size === 0) {
            connection.destroy();
            console.log("Leaving empty channel...");
        }
    }
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    // أمر الدخول (بدون دفن وبدون ميوت)
    if (message.content.startsWith('/join')) {
        const member = message.member;
        const channel = member?.voice.channel;

        if (!channel) return message.reply("Join a voice channel first, Casper.");

        try {
            joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false, // شلنا الدفن
                selfMute: false, // شلنا الميوت
            });

            const replies = ["I am on my way", "I am coming", "I am here"];
            return message.reply(replies[Math.floor(Math.random() * replies.length)]);
        } catch (error) {
            console.error(error);
            return message.reply("Error joining the channel.");
        }
    }

    // نظام الدردشة (فصحى + بريطاني + بدون إيموجيات)
    if (message.content.startsWith('!')) {
        const prompt = message.content.slice(1).trim();
        if (!prompt) return;

        try {
            const systemInstruction = `
            Your name is Toriel. Strict rules:
            1. Never use emojis.
            2. If the user speaks Arabic, respond ONLY in Modern Standard Arabic (Fusha).
            3. If the user speaks English, respond ONLY in English with a British accent (use words like 'mate', 'brilliant', 'rubbish').
            4. Never use local slang like 'أبشر'.
            5. Be sophisticated and concise.`;
            
            const fullPrompt = `${systemInstruction}\n\nUser: ${prompt}`;
            const response = await chat(fullPrompt);
            await message.reply(response);
        } catch (err) {
            console.error(err);
            await message.reply("System error occurred.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
