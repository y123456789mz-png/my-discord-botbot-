import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import http from 'http';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

http.createServer((req, res) => {
    res.writeHead(200); res.end("Toriel is Elegant & Ready with Direct GIF Links.");
}).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// روابط مباشرة تنتهي بـ .gif عشان ديسكورد يعرضها كصورة متحركة بدون مربعات
const workingGifs = [
    'https://media1.tenor.com/m/1l6G7L7Y9YAAAAAd/osaka-azumanga-daioh.gif',
    'https://media1.tenor.com/m/a-4467qZq2kAAAAd/anime-tea.gif',
    'https://media1.tenor.com/m/h9s1-L7fS6UAAAAd/anime-wave.gif',
    'https://media1.tenor.com/m/Z619x33eD0cAAAAd/anime-smile.gif',
    'https://media1.tenor.com/m/2e_dM-uQk-kAAAAd/reading-book-anime.gif'
];

async function handleGroqStream(prompt: string, message: any) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) return;

    try {
        const groq = new Groq({ apiKey: GROQ_API_KEY });
        const stream = await groq.chat.completions.create({
            messages: [{ role: 'system', content: "أنتِ Toriel، ردي مختصر ومباشر. إذا عربي ردي عربي، إذا إنجليزي ردي إنجليزي." }, { role: 'user', content: prompt }],
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            stream: true,
        });

        let fullResponse = '';
        const replyMessage = await message.reply("⏳ ...");

        for await (const chunk of stream) {
            fullResponse += chunk.choices[0]?.delta?.content || '';
        }

        // استخدام رابط مباشر ينتهي بـ .gif
        const embed = new EmbedBuilder()
            .setDescription(fullResponse || "...")
            .setImage(workingGifs[Math.floor(Math.random() * workingGifs.length)]);

        await replyMessage.edit({ content: "", embeds: [embed] });
    } catch (err) {
        console.error(err);
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.mentions.users.has(client.user!.id)) return;
    const prompt = message.content.replace(/<@!?\d+>/g, '').trim();
    if (prompt) await handleGroqStream(prompt, message);
});

client.login(process.env.DISCORD_TOKEN);
