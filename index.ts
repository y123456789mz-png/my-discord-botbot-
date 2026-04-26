import { Client, GatewayIntentBits, Events } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { chat } from './bot.ts'; 
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// سيرفر عشان ريندر ما يطفي البوت
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Toriel is Awake');
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
    console.log(`✅ ${c.user.tag} Online.`);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    // أمر الدخول - إزالة الدفن غصب
    if (message.content.startsWith('/join')) {
        const channel = message.member?.voice.channel;
        if (!channel) return message.reply("Join a voice channel first.");

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false, 
            selfMute: false,
        });

        // حل مشكلة الخروج المفاجئ (إعادة اتصال تلقائي)
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    new Promise((resolve) => setTimeout(resolve, 5000)),
                ]);
                // إذا فصل، يحاول يرجع يشبك
            } catch (e) { connection.destroy(); }
        });

        const replies = ["I am on my way", "I am coming", "I am here"];
        return message.reply(replies[Math.floor(Math.random() * replies.length)]);
    }

    // الرد على الشات (منشن أو علامة تعجب)
    if (message.mentions.has(client.user!) || message.content.startsWith('!')) {
        const input = message.content.replace(/<@!?\d+>/g, '').replace('!', '').trim();
        if (!input) return;

        try {
            // نرسل النص لـ bot.ts وننتظر الرد
            const response = await chat(input);
            if (response) {
                await message.reply(response);
            }
        } catch (err) {
            console.error("GROQ Error:", err);
            await message.reply("Internal system error.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
