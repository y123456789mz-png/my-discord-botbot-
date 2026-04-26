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
    console.log(`✅ ${c.user.tag} is online.`);
});

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

    // أمر دخول الروم
    if (message.content.startsWith('/join')) {
        const member = message.member;
        const channel = member?.voice.channel;

        if (!channel) return message.reply("Join a voice channel first, Casper.");

        try {
            joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false, 
                selfMute: false,
            });

            const replies = ["I am on my way", "I am coming", "I am here"];
            return message.reply(replies[Math.floor(Math.random() * replies.length)]);
        } catch (error) {
            return message.reply("Connection error.");
        }
    }

    // الرد على الشات
    if (message.mentions.has(client.user!) || message.content.startsWith('!')) {
        const userInput = message.content.replace(/<@!?\d+>/g, '').replace('!', '').trim();
        if (!userInput) return;

        try {
            // أرسل النص مباشرة لملف bot.ts وخلي bot.ts هو اللي يتعامل مع الشخصية
            const response = await chat(userInput);
            await message.reply(response);
        } catch (err) {
            console.error(err);
            await message.reply("A technical hitch!");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
