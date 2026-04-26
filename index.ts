import { Client, GatewayIntentBits, Events } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import { chat } from './bot.ts'; 
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Toriel is Live!');
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
    console.log(`✅ ${c.user.tag} is online and functioning properly.`);
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

    if (message.content.startsWith('/join')) {
        const channel = message.member?.voice.channel;
        if (!channel) return message.reply("Join a voice channel first, Casper.");

        try {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false, 
                selfMute: false,
            });
            // حل الدفن النهائي
            connection.rejoin({ selfDeaf: false, selfMute: false });
            return message.reply("I am on my way");
        } catch (error) {
            return message.reply("Error connecting to voice.");
        }
    }

    if (message.mentions.has(client.user!) || message.content.startsWith('!')) {
        const input = message.content.replace(/<@!?\d+>/g, '').replace('!', '').trim();
        if (!input) return;

        try {
            const response = await chat(input);
            await message.reply(response);
        } catch (err) {
            await message.reply("A technical hitch!");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
