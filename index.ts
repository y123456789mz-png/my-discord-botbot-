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
    console.log(`✅ ${client.user?.tag} is active.`);
});

// ميزة الخروج التلقائي إذا فضي الروم
client.on('voiceStateUpdate', (oldState) => {
    const connection = getVoiceConnection(oldState.guild.id);
    if (connection) {
        const channel = oldState.channel;
        if (channel && channel.members.filter(m => !m.user.bot).size === 0) {
            connection.destroy();
            console.log("Room is empty, leaving...");
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('/join')) {
        const member = message.member;
        const channel = member?.voice.channel;

        if (!channel) return message.reply("Join a voice channel first, Casper.");

        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const replies = ["I am on my way", "I am coming", "I am here"];
        return message.reply(replies[Math.floor(Math.random() * replies.length)]);
    }

    if (message.content.startsWith('!')) {
        const prompt = message.content.slice(1).trim();
        if (!prompt) return;

        try {
            // توجيه الشخصية داخل الـ Prompt بدون تعقيد عشان ما تهلوس
            const systemInstruction = `
            You are Toriel. 
            - If the user speaks Arabic, respond ONLY in Modern Standard Arabic (Fusha).
            - If the user speaks English, respond ONLY in English with a subtle British accent and vocabulary (e.g., use 'bloody', 'mate', 'brilliant' occasionally).
            - Stay independent and concise. No emojis.`;
            
            const finalPrompt = `${systemInstruction}\n\nUser: ${prompt}`;
            const response = await chat(finalPrompt);
            await message.reply(response);
        } catch (err) {
            await message.reply("System error.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
