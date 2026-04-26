import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import { chat } from './bot.ts'; // تأكد إن الاسم كذا بالضبط عندك
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates, // ضروري عشان الصوت
    ],
});

client.once('ready', () => {
    console.log(`✅ ${client.user?.tag} اشتغل ودخل الخدمة!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // أمر دخول الروم الصوتي
    if (message.content.startsWith('/join')) {
        const member = message.member;
        const channel = member?.voice.channel;

        if (!channel) {
            return message.reply('يا كاسبر ادخل روم أول عشان ألحقك! 🏃‍♂️');
        }

        try {
            joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            return message.reply(`✅ أبشر، دخلت روم ${channel.name}!`);
        } catch (error) {
            console.error(error);
            return message.reply('صار عندي مغص وما قدرت أدخل الروم.. شيك على الـ Logs!');
        }
    }

    // نظام الدردشة الذكي اللي ضبطناه
    if (message.content.startsWith('!')) {
        const prompt = message.content.slice(1).trim();
        if (!prompt) return;

        try {
            const response = await chat(prompt);
            await message.reply(response);
        } catch (err) {
            console.error(err);
            await message.reply('والله ياهو معلق مخي شوي.. جرب تسألني بعدين.');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
