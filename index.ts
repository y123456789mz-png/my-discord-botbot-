import { Client, GatewayIntentBits, Events } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus } from '@discordjs/voice';
import { chat } from './bot.ts'; 
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// سيرفر وهمي عشان ريندر ما يطفي البوت
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
    console.log(`✅ ${c.user.tag} is online and ready.`);
});

// الخروج التلقائي إذا فضي الروم
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

    // أمر دخول الروم - حل مشكلة الدفن والميوت نهائياً
    if (message.content.startsWith('/join')) {
        const channel = message.member?.voice.channel;
        if (!channel) return message.reply("Join a voice channel first, Casper.");

        try {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false, // شيل الدفن
                selfMute: false, // شيل الميوت
            });

            // تأكيد ثاني لإزالة الدفن
            connection.rejoin({ selfDeaf: false, selfMute: false });

            const replies = ["I am on my way", "I am coming", "I am here"];
            return message.reply(replies[Math.floor(Math.random() * replies.length)]);
        } catch (error) {
            return message.reply("Error connecting to voice.");
        }
    }

    // الرد على الشات (منشن أو علامة تعجب)
    if (message.mentions.has(client.user!) || message.content.startsWith('!')) {
        const input = message.content.replace(/<@!?\d+>/g, '').replace('!', '').trim();
        if (!input) return;

        try {
            // نطلب الرد من bot.ts
            const response = await chat(input);
            await message.reply(response);
        } catch (err) {
            await message.reply("A technical hitch!");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
