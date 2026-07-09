import { Client, GatewayIntentBits, Message } from 'discord.js';
import { GoogleGenAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// لإستخدام __dirname في ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// ================ سيرفر الوهمي لـ Render ================
http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Toriel is Stable 🐐");
}).listen(process.env.PORT || 3000);

// ================ التحقق من المتغيرات ================
if (!process.env.DISCORD_TOKEN || !process.env.GEMINI_API_KEY) {
    console.error('❌ خطأ: تأكد من إضافة DISCORD_TOKEN و GEMINI_API_KEY في ملف .env');
    process.exit(1);
}

// ================ إعداد عميل ديسكورد ================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// ================ نظام الـ GIFs المتقدم ================
const GIF_CATEGORIES = {
    romantic: [
        'https://media1.tenor.com/m/a-4467qZq2kAAAAd/anime-tea.gif',
        'https://media1.tenor.com/m/2e_dM-uQk-kAAAAd/reading-book-anime.gif',
        'https://media1.tenor.com/m/9tK9VlJzQy0AAAAd/anime-love.gif',
        'https://media1.tenor.com/m/x8v1vLgHrP0AAAAd/anime-cute.gif'
    ],
    angry: [
        'https://media1.tenor.com/m/1l6G7L7Y9YAAAAAd/osaka-azumanga-daioh.gif',
        'https://media1.tenor.com/m/h9s1-L7fS6UAAAAd/anime-wave.gif',
        'https://media1.tenor.com/m/Ka9J5ZQ3d9kAAAAd/anime-angry.gif'
    ],
    happy: [
        'https://media1.tenor.com/m/Z619x33eD0cAAAAd/anime-smile.gif',
        'https://media1.tenor.com/m/2e_dM-uQk-kAAAAd/reading-book-anime.gif',
        'https://media1.tenor.com/m/j-WxKxRXWAIAAAAd/anime-happy.gif'
    ],
    sad: [
        'https://media1.tenor.com/m/5Hn5J7VKvNkAAAAd/anime-cry.gif',
        'https://media1.tenor.com/m/7mK8JHqPmjUAAAAd/anime-sad.gif'
    ],
    confused: [
        'https://media1.tenor.com/m/9mKvL7PJqH0AAAAd/anime-confused.gif',
        'https://media1.tenor.com/m/8jVKv7JPMjIAAAAd/anime-thinking.gif'
    ],
    default: [
        'https://media1.tenor.com/m/Z619x33eD0cAAAAd/anime-smile.gif',
        'https://media1.tenor.com/m/h9s1-L7fS6UAAAAd/anime-wave.gif'
    ]
};

// كلمات مفتاحية للتصنيف السريع (حالة الطوارئ)
const KEYWORD_MAP = {
    romantic: ['حب', 'عشق', 'غرام', 'قلب', 'رومنسي', 'حبيبي', 'حبيبتي', 'كشخة', 'شوق'],
    angry: ['غضب', 'زعل', 'معصب', 'غيظ', 'نرفز', 'حرق', 'كتمة', 'انفجر'],
    happy: ['فرح', 'سعيد', 'ضحك', 'مبسوط', 'مرتاح', 'حلو', 'جميل', 'يا هلا'],
    sad: ['حزين', 'بكي', 'زعلان', 'مكتئب', 'تعيس', 'مقهور'],
    confused: ['محتار', 'حيران', 'وش ذا', 'مدري', 'مافهمت', 'غريب']
};

// ================ دالة اختيار GIF الذكية ================
function getSmartGif(text: string, emotion?: string): string {
    // إذا حددت المشاعر من الـ AI
    if (emotion && GIF_CATEGORIES[emotion as keyof typeof GIF_CATEGORIES]) {
        const category = GIF_CATEGORIES[emotion as keyof typeof GIF_CATEGORIES];
        return category[Math.floor(Math.random() * category.length)];
    }

    // البحث عن كلمات مفتاحية في النص
    const lowerText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword)) {
                const gifs = GIF_CATEGORIES[category as keyof typeof GIF_CATEGORIES];
                return gifs[Math.floor(Math.random() * gifs.length)];
            }
        }
    }

    // إذا مالقينا شي، نرسل GIF عشوائي
    const defaultGifs = GIF_CATEGORIES.default;
    return defaultGifs[Math.floor(Math.random() * defaultGifs.length)];
}

// ================ تهيئة الذكاء الاصطناعي ================
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = ai.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `أنتِ "Toriel" من لعبة Undertale. شخصيتكِ هادئة، حكيمة، وأمومية للشباب في السيرفر.

شروط صارمة جداً:
1. تحدثي بلهجة سعودية خفيفة ورايقة (أو فصحى مبسطة إذا لزم الأمر).
2. ممنوع الكرنج أو الردود الطفولية السخيفة.
3. إذا سألك أحد عن معلومة ولا تعرفينها، قولي صراحة "ما أعرف" أو "علمي علمك" ولا تخترعين إجابات.
4. ردودك تكون مختصرة ومباشرة (ماكس 3-4 جمل).
5. في نهاية كل رد، ضعي كلمة مفتاحية بين قوسين { } لتحدد المشاعر: 
   - {romantic} إذا كان الكلام رومانسي أو عاطفي
   - {angry} إذا كان الكلام عصبي أو مستفز
   - {happy} إذا كان الكلام سعيد أو مرح
   - {sad} إذا كان الكلام حزين
   - {confused} إذا كان الكلام محتار أو غريب
   مثال: "هلا بك كاسبر، شكلك مبسوط اليوم {happy}"`,
});

// ================ حدث تشغيل البوت ================
client.once('ready', () => {
    console.log(`✅ تم تشغيل البوت بنجاح! باسم: ${client.user?.tag}`);
    console.log(`📊 عدد السيرفرات: ${client.guilds.cache.size}`);
});

// ================ حدث الرسائل ================
client.on('messageCreate', async (message: Message) => {
    // تجاهل رسائل البوتات
    if (message.author.bot) return;

    // التأكد أن البوت مذكور
    if (client.user && message.mentions.has(client.user)) {
        // تنظيف النص من التاق
        const cleanPrompt = message.content
            .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
            .trim();

        // إذا مافيه نص
        if (!cleanPrompt) {
            const gif = getSmartGif('مرحباً');
            await message.reply(`هلا بك كاسبر 🌸 مناديني تبي شيء؟\n${gif}`);
            return;
        }

        // إظهار أن البوت يكتب
        await message.channel.sendTyping();

        try {
            // طلب الرد من Gemini
            const result = await model.generateContent(cleanPrompt);
            const responseText = result.response.text();

            if (responseText && responseText.trim().length > 0) {
                // استخراج المشاعر من النص
                const emotionMatch = responseText.match(/\{(romantic|angry|happy|sad|confused)\}/);
                const emotion = emotionMatch ? emotionMatch[1] : undefined;
                
                // تنظيف النص من الكود المفتاحي
                const cleanResponse = responseText.replace(/\{.*?\}/, '').trim();

                // اختيار GIF
                const gif = getSmartGif(cleanPrompt, emotion);

                // إرسال الرد مع GIF
                await message.reply(`${cleanResponse}\n\n${gif}`);
            } else {
                const gif = getSmartGif('خطأ');
                await message.reply(`اممم، ما جاني رد واضح من النظام الحين.\n${gif}`);
            }
        } catch (error) {
            console.error('❌ خطأ في الذكاء الاصطناعي:', error);
            const gif = getSmartGif('مشكلة');
            await message.reply(`عذراً، يبدو أن النظام واجه مشكلة حالياً. جرب بعد شوي.\n${gif}`);
        }
    }
});

// ================ تشغيل البوت ================
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('❌ فشل تسجيل الدخول:', error);
});
