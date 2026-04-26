import { Client, GatewayIntentBits, Events } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import { chat } from './bot.ts'; 
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

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

client.once(Events.ClientReady, (c) => {
    console.log(`✅ ${c.user.tag} is online and listening.`);
});

// الخروج التلقائي
client.on(Events.VoiceStateUpdate, (oldState) => {
    const connection = getVoiceConnection(oldState.guild.id);
    if (connection) {
        const channel = oldState.channel;
        if (channel && channel.members.filter(m => !m.user.bot).size === 0) {
            connection.destroy();
        }
    }
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    // أمر الدخول - مع تشديد على إزالة الدفن والميوت
    if (message.content.startsWith('/join')) {
        const member = message.member;
        const channel = member?.voice.channel;

        if (!channel) return message.reply("Join a voice channel first, Casper.");

        try {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false, 
                selfMute: false,
            });

            // تأكيد إضافي لإزالة الدفن
            connection.rejoin({ selfDeaf: false, selfMute: false });

            const replies = ["I am on my way", "I am coming", "I am here"];
            return message.reply(replies[Math.floor(Math.random() * replies.length)]);
        } catch (error) {
            return message.reply("Connection error.");
        }
    }

    // الرد على الشات (إذا فيه منشن للبوت أو بدأ بـ !)
    if (message.mentions.has(client.user!) || message.content.startsWith('!')) {
        // تنظيف الرسالة من المنشن عشان ما يروح للذكاء الاصطناعي ويخرب عليه
        const prompt = message.content.replace(/<@!?\d+>/g, '').replace('!', '').trim();
        
        if (!prompt) return;

        try {
            const systemInstruction = `
            Your name is Toriel. Strict rules:
            1. Never use emojis.
            2. If the user speaks Arabic, respond ONLY in Modern Standard Arabic (Fusha).
            3. If the user speaks English, respond ONLY in English with a British accent (mate, brilliant, lovely).
            4. Never say 'أبشر'. 
            5. Be sophisticated and concise.`;
            
            const response = await chat(`${systemInstruction}\n\nUser: ${prompt}`);
            await message.reply(response);
        } catch (err) {
            await message.reply("System error.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
