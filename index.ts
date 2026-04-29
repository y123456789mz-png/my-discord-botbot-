import http from 'http';

// سيرفر وهمي لإرضاء ريندر (Render Keep Alive)
http.createServer((req, res) => {
    res.write("Toriel is Alive!");
    res.end();
}).listen(10000); // ريندر يدور على هذا البورت 10000

import { Client, GatewayIntentBits, Message } from 'discord.js';
import { chat } from './bot'; 

// باقي الكود حقك كما هو...
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', () => {
    console.log(`✅ توريال أونلاين! سجلت الدخول باسم: ${client.user?.tag}`);
});

client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return;
    if (message.mentions.has(client.user!)) {
        const prompt = message.content.replace(`<@${client.user?.id}>`, '').trim();
        try {
            await message.channel.sendTyping();
            const response = await chat(prompt, message.author.id);
            await message.reply(response);
        } catch (error) {
            console.error(error);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
