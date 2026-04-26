import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import { chat } from './bot.ts'; 
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.once('ready', () => {
    console.log(`✅ Toriel is active.`);
});

// ميزة الخروج التلقائي (إذا فضي الروم تطلع فوراً)
client.on('voiceStateUpdate', (oldState) => {
    const connection = getVoiceConnection(oldState.guild.id);
    if (connection) {
        const channel = oldState.channel;
        // يشيك إذا الروم صار ما فيه إلا بوتات أو فضي تماماً
        if (channel && channel.members.filter(m => !m.user.bot).size === 0) {
            connection.destroy();
            console.log("Room empty. Leaving...");
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // أوامر دخول الروم الصوتي (ردود بريطانية نظيفة)
    if (message.content.startsWith('/join')) {
        const member = message.member;
        const channel = member?.voice.channel;

        if (!channel) return message.reply("Join a voice channel first, Casper.");

        try {
            joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });

            const replies = ["I am on my way", "I am coming", "I am here"];
            return message.reply(replies[Math.floor(Math.random() * replies.length)]);
        } catch (error) {
            return message.reply("Connection error.");
        }
    }

    // نظام الدردشة (الفصحى + اللكنة البريطانية)
    if (message.content.startsWith('!')) {
        const prompt = message.content.slice(1).trim();
        if (!prompt) return;

        try {
            // تعليمات الشخصية (System Instructions) عشان نمنع الهلوسة والإيموجيات
            const systemInstruction = `
            Your name is Toriel. Strict rules:
            1. Never use emojis.
            2. If the user speaks Arabic, you must respond in Modern Standard Arabic (Fusha) only. No slang.
            3. If the user speaks English, you must use a British accent (use words like: mate, brilliant, lovely, rubbish).
            4. Be independent, sophisticated, and concise. 
            5. Never use the word 'أبشر'.`;
            
            const fullPrompt = `${systemInstruction}\n\nUser: ${prompt}`;
            const response = await chat(fullPrompt);
            
            await message.reply(response);
        } catch (err) {
            console.error(err);
            await message.reply("System error.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
