import { Client, GatewayIntentBits } from 'discord.js';
import http from 'http';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// سيرفر وهمي للـ Render
http.createServer((req, res) => {
    res.writeHead(200); res.end("Toriel is Stable.");
}).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// لستة روابط مباشرة ومضمونة 100%، ديسكورد يعرضها كصورة بدون روابط
const fixedGifs = [
    'https://media1.tenor.com/m/1l6G7L7Y9YAAAAAd/osaka-azumanga-daioh.gif',
    'https://media1.tenor.com/m/a-4467qZq2kAAAAd/anime-tea.gif',
    'https://media1.tenor.com/m/h9s1-L7fS6UAAAAd/anime-wave.gif',
    'https://media1.tenor.com/m/Z619x33eD0cAAAAd/anime-smile.gif',
    'https://media1.tenor.com/m/2e_dM-uQk-kAAAAd/reading-book-anime.gif'
];

async function handleResponse(prompt: string, message: any) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    try {
        const chat = await groq.chat.completions.create({
            messages: [{ role: 'system', content: "أنتِ Toriel، ردودك مختصرة جداً ومباشرة." }, { role: 'user', content: prompt }],
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        });

        const reply = chat.choices[0].message.content;
        const gif = fixedGifs[Math.floor(Math.random() * fixedGifs.length)];
        
        // نرسل النص، والديسكورد بيعرض الصورة تحتها تلقائياً بدون ما يبين الرابط "كنص"
        await message.reply(`${reply}\n${gif}`);
        
    } catch (err) {
        console.error("خطأ في معالجة الرد:", err);
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
