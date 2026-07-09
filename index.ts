import { Client, GatewayIntentBits } from 'discord.js';
import http from 'http';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

http.createServer((req, res) => {
    res.writeHead(200); res.end("Toriel is Active.");
}).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// روابط Klipy اللي أنت جبتها، ديسكورد يفتحه كـ Native GIF
const klipyGifs = [
    'https://klipy.com/gifs/osaka-spin-3',
    'https://klipy.com/gifs/anime-tea-drinking',
    'https://klipy.com/gifs/anime-wave-hello',
    'https://klipy.com/gifs/anime-smile-happy'
];

async function handleResponse(prompt: string, message: any) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    try {
        const chat = await groq.chat.completions.create({
            messages: [{ role: 'system', content: "رد مختصر جداً" }, { role: 'user', content: prompt }],
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        });

        const reply = chat.choices[0].message.content;
        const gif = klipyGifs[Math.floor(Math.random() * klipyGifs.length)];
        
        // نرسل النص وبعده الرابط مباشرة، ديسكورد بيحوله لـ GIF تلقائي
        await message.reply(`${reply}\n${gif}`);
        
    } catch (err) {
        console.error(err);
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.mentions.users.has(client.user!.id)) {
        const prompt = message.content.replace(/<@!?\d+>/g, '').trim();
        if (prompt) await handleResponse(prompt, message);
    }
});

client.login(process.env.DISCORD_TOKEN);
