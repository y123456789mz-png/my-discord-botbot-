import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import http from 'http';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

http.createServer((req, res) => {
    res.writeHead(200); res.end("Toriel is Elegant & Ready with Native Embed GIFs.");
}).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// روابط GIFs أنمي مباشرة ومضمونة 100% من اللي أنت جربتها
const workingGifs = [
    'https://klipy.com/gifs/osaka-spin-3',
    'https://klipy.com/gifs/anime-tea-drinking',
    'https://klipy.com/gifs/anime-wave-hello',
    'https://klipy.com/gifs/anime-smile-happy',
    'https://klipy.com/gifs/anime-reading-book'
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

        // هنا السحر: نحط النص في الـ Description، والـ GIF في الـ Image (الرابط بيختفي)
        const embed = new EmbedBuilder()
            .setDescription(fullResponse || "...")
            .setImage(workingGifs[Math.floor(Math.random() * workingGifs.length)] + "/raw"); // إضافة /raw عشان يظهر كـ GIF

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
