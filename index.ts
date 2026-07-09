import { Client, GatewayIntentBits, Message } from 'discord.js';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// لإستخدام __dirname في ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// ================ سيرفر HTTP لـ Render ================
const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>Toriel Bot</title></head>
            <body style="background: #1a1a2e; color: #fff; font-family: Arial; text-align: center; padding: 50px;">
                <h1>🐐 Toriel is Running!</h1>
                <p>Status: <span style="color: #4CAF50;">● Online</span></p>
                <p>Uptime: ${process.uptime().toFixed(0)} seconds</p>
                <p>Servers: ${client?.guilds?.cache?.size || 0}</p>
                <small>Discord Bot by Casper</small>
            </body>
            </html>
        `);
    } else {
        res.writeHead(404);
        res.end('404 Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ HTTP Server running on port ${PORT}`);
});

// ================ التحقق من المتغيرات ================
if (!process.env.DISCORD_TOKEN || !process.env.GROQ_API_KEY) {
    console.error('❌ خطأ: تأكد من إضافة DISCORD_TOKEN و GROQ_API_KEY في متغيرات البيئة');
    process.exit(1);
}

// ================ إعداد عميل ديسكورد ================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ================ تحميل قائمة الـ GIFs ================
let gifs: string[] = [];
try {
    const gifsPath = path.join(__dirname, 'gifs.json');
    if (fs.existsSync(gifsPath)) {
        const gifsData = fs.readFileSync(gifsPath, 'utf-8');
        gifs = JSON.parse(gifsData);
        console.log(`✅ تم تحميل ${gifs.length} GIF`);
    } else {
        // قائمة احتياطية لو ما لقى الملف
        gifs = [
            'https://media1.tenor.com/m/Z619x33eD0cAAAAd/anime-smile.gif',
            'https://media1.tenor.com/m/a-4467qZq2kAAAAd/anime-tea.gif',
            'https://media1.tenor.com/m/h9s1-L7fS6UAAAAd/anime-wave.gif'
        ];
        console.log('⚠️ ملف gifs.json غير موجود، استخدم القائمة الاحتياطية');
    }
} catch (error) {
    console.error('❌ خطأ في تحميل gifs.json:', error);
    gifs = [
        'https://media1.tenor.com/m/Z619x33eD0cAAAAd/anime-smile.gif',
        'https://media1.tenor.com/m/a-4467qZq2kAAAAd/anime-tea.gif'
    ];
}

// ================ نظام اختيار GIF حسب المشاعر ================
function getGifByEmotion(text: string): string {
    const lowerText = text.toLowerCase();
    
    // كلمات مفتاحية للمشاعر
    const emotions = {
        romantic: ['حب', 'عشق', 'غرام', 'رومنسي', 'حبيبي', 'قلب', 'شوق'],
        angry: ['غضب', 'زعل', 'معصب', 'نرفز', 'غيظ', 'حرق'],
        happy: ['فرح', 'سعيد', 'ضحك', 'مبسوط', 'مرتاح', 'هلا'],
        sad: ['حزين', 'بكي', 'زعلان', 'مكتئب', 'مقهور']
    };

    // البحث عن كلمات مفتاحية
    for (const [emotion, keywords] of Object.entries(emotions)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword)) {
                // نستخدم القائمة الموجودة ولكن نأخذ منها حسب المشاعر
                const emotionIndex = Object.keys(emotions).indexOf(emotion);
                const gifIndex = emotionIndex % gifs.length;
                return gifs[gifIndex];
            }
        }
    }

    // إذا مالقينا شيء، نرسل GIF عشوائي
    return gifs[Math.floor(Math.random() * gifs.length)];
}

// ================ تهيئة Groq ================
const groq = new Groq({ 
    apiKey: process.env.GROQ_API_KEY 
});

// ================ دالة معالجة الردود ================
async function handleResponse(prompt: string, message: Message) {
    try {
        // إظهار أن البوت يكتب
        await message.channel.sendTyping();

        const chat = await groq.chat.completions.create({
            messages: [
                { 
                    role: 'system', 
                    content: `أنتِ "Toriel" من لعبة Undertale. شخصيتكِ هادئة، حكيمة، وأمومية.

شروط صارمة:
1. تحدثي بلهجة سعودية خفيفة ورايقة.
2. ممنوع الكرنج أو الردود الطفولية.
3. إذا ما تعرفين المعلومة، قولي "ما أعرف" ولا تخترعين.
4. ردودك مختصرة (3-4 جمل كحد أقصى).
5. دائماً خلي ردودك مفيدة ومحترمة.`
                },
                { 
                    role: 'user', 
                    content: prompt 
                }
            ],
            model: 'mixtral-8x7b-32768',
            temperature: 0.7,
            max_tokens: 200,
        });

        const reply = chat.choices[0]?.message?.content || 'ما جاني رد واضح الحين.';
        
        // اختيار GIF حسب الكلام
        const gif = getGifByEmotion(prompt + ' ' + reply);
        
        // إرسال الرد مع GIF
        await message.reply(`${reply}\n\n${gif}`);
        
    } catch (error) {
        console.error('❌ خطأ في معالجة الرد:', error);
        const gif = gifs[Math.floor(Math.random() * gifs.length)];
        await message.reply(`عذراً، واجهت مشكلة في معالجة طلبك. جرب بعد شوي.\n${gif}`);
    }
}

// ================ حدث تشغيل البوت ================
client.once('ready', () => {
    console.log(`✅ تم تشغيل البوت بنجاح!`);
    console.log(`📌 اسم البوت: ${client.user?.tag}`);
    console.log(`📊 عدد السيرفرات: ${client.guilds.cache.size}`);
    console.log(`🎯 عدد الـ GIFs: ${gifs.length}`);
    console.log(`🔗 رابط الدعوة: https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=8&scope=bot`);
});

// ================ حدث الرسائل ================
client.on('messageCreate', async (message: Message) => {
    // تجاهل رسائل البوتات
    if (message.author.bot) return;

    // التحقق من منشن البوت
    if (message.mentions.users.has(client.user!.id)) {
        // تنظيف النص من التاق
        const prompt = message.content
            .replace(new RegExp(`<@!?${client.user?.id}>`, 'g'), '')
            .trim();

        // إذا مافيه نص
        if (!prompt) {
            const gif = gifs[Math.floor(Math.random() * gifs.length)];
            await message.reply(`هلا بك 🌸 مناديني تبي شيء؟\n${gif}`);
            return;
        }

        // معالجة الرد
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
