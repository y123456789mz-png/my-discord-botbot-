import { Client, GatewayIntentBits, Message } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai';  // ✅ التعديل هنا
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// ================ سيرفر HTTP ================
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>Toriel Bot</title></head>
        <body style="background: #1a1a2e; color: #fff; font-family: Arial; text-align: center; padding: 50px;">
            <h1>🐐 Toriel is Running!</h1>
            <p>Status: <span style="color: #4CAF50;">● Online</span></p>
            <p>Uptime: ${process.uptime().toFixed(0)} seconds</p>
            <small>Discord Bot by Casper</small>
        </body>
        </html>
    `);
});
server.listen(process.env.PORT || 3000);

// ================ إعداد البوت ================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ================ 100 GIF ================
const GIFS = [
    'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif',
    'https://media.giphy.com/media/3o6ZsVUZv7zLfKJrK8/giphy.gif',
    'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    'https://media.giphy.com/media/3o6Zt8aF5bqMwJjKHg/giphy.gif',
    'https://media.giphy.com/media/3o6ZsVW8z9Xj5jGjK8/giphy.gif',
    'https://media.giphy.com/media/l0HlNQbM8BfC5xXbK/giphy.gif',
    'https://media.giphy.com/media/3o6Zt8aF5bqMwJjKHg/giphy.gif',
    'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    'https://media.giphy.com/media/3o6ZsVZvU7zLfKJrK8/giphy.gif',
    'https://media.giphy.com/media/3o6Zt8aF5bqMwJjKHg/giphy.gif'
];

// ================ اختيار GIF حسب المشاعر ================
function getGifByEmotion(text: string): string {
    const lowerText = text.toLowerCase();
    
    const emotions = {
        romantic: ['حب', 'عشق', 'غرام', 'رومنسي', 'حبيبي', 'قلب', 'شوق'],
        angry: ['غضب', 'زعل', 'معصب', 'غيظ', 'نرفز', 'حرق'],
        happy: ['فرح', 'سعيد', 'ضحك', 'مبسوط', 'مرتاح', 'هلا'],
        sad: ['حزين', 'بكي', 'زعلان', 'مكتئب', 'مقهور'],
        confused: ['محتار', 'حيران', 'مدري', 'مافهمت', 'غريب']
    };

    for (const [emotion, keywords] of Object.entries(emotions)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword)) {
                const emotionIndex = Object.keys(emotions).indexOf(emotion);
                const start = emotionIndex * 2;
                const end = start + 2;
                const emotionGifs = GIFS.slice(start, end);
                return emotionGifs[Math.floor(Math.random() * emotionGifs.length)];
            }
        }
    }

    return GIFS[Math.floor(Math.random() * GIFS.length)];
}

// ================ تهيئة Gemini (بالصيغة الصحيحة) ================
// ✅ التعديل هنا
const ai = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
const model = ai.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `أنتِ "Toriel" من لعبة Undertale. شخصيتكِ هادئة، حكيمة، وأمومية.

شروط صارمة:
1. تحدثي بلهجة سعودية خفيفة ورايقة.
2. ممنوع الكرنج أو الردود الطفولية تماماً.
3. إذا ما تعرفين المعلومة، قولي "ما أعرف" أو "علمي علمك" ولا تخترعين إجابات من رأسك.
4. ردودك مختصرة ومباشرة (3-4 جمل كحد أقصى).`
});

// ================ دالة معالجة الردود ================
async function handleResponse(prompt: string, message: Message) {
    try {
        await message.channel.sendTyping();

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        if (responseText && responseText.trim().length > 0) {
            const gif = getGifByEmotion(prompt + ' ' + responseText);
            await message.reply(`${responseText}\n\n${gif}`);
        } else {
            const gif = GIFS[Math.floor(Math.random() * GIFS.length)];
            await message.reply(`اممم، ما جاني رد واضح من النظام الحين.\n${gif}`);
        }
    } catch (error) {
        console.error('❌ خطأ في الذكاء الاصطناعي:', error);
        const gif = GIFS[Math.floor(Math.random() * GIFS.length)];
        await message.reply(`عذراً، واجهت مشكلة في معالجة طلبك. جرب بعد شوي.\n${gif}`);
    }
}

// ================ حدث تشغيل البوت ================
client.once('ready', () => {
    console.log(`✅ تم تشغيل البوت بنجاح!`);
    console.log(`📌 اسم البوت: ${client.user?.tag}`);
    console.log(`📊 عدد السيرفرات: ${client.guilds.cache.size}`);
    console.log(`🎯 عدد الـ GIFs: ${GIFS.length}`);
});

// ================ حدث الرسائل ================
client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return;

    if (message.mentions.users.has(client.user!.id)) {
        const prompt = message.content
            .replace(new RegExp(`<@!?${client.user?.id}>`, 'g'), '')
            .trim();

        if (!prompt) {
            const gif = GIFS[Math.floor(Math.random() * GIFS.length)];
            await message.reply(`هلا بك 🌸 مناديني تبي شيء؟\n${gif}`);
            return;
        }

        await handleResponse(prompt, message);
    }
});

// ================ تشغيل البوت ================
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('❌ فشل تسجيل الدخول:', error);
    process.exit(1);
});

// ================ معالجة إيقاف البوت ================
process.on('SIGINT', () => {
    console.log('🛑 جاري إيقاف البوت...');
    client.destroy();
    server.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 جاري إيقاف البوت...');
    client.destroy();
    server.close();
    process.exit(0);
});
