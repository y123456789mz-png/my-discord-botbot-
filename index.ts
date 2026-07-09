import { Client, GatewayIntentBits, Message } from 'discord.js';
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

// ================ 100 GIF أنمي (كلها من Tenor) ================
const GIFS = [
    // 😊 سعيد/مبسوط
    'https://media1.tenor.com/m/Z619x33eD0cAAAAd/anime-smile.gif',
    'https://media1.tenor.com/m/j-WxKxRXWAIAAAAd/anime-happy.gif',
    'https://media1.tenor.com/m/6xHqJkYP7bMAAAAd/anime-dance.gif',
    'https://media1.tenor.com/m/2e_dM-uQk-kAAAAd/reading-book-anime.gif',
    'https://media1.tenor.com/m/8vBxHqJkPYoAAAAd/anime-laugh.gif',
    'https://media1.tenor.com/m/9tK9VlJzQy0AAAAd/anime-love.gif',
    'https://media1.tenor.com/m/4XqNvJkMHcYAAAAd/anime-blush.gif',
    'https://media1.tenor.com/m/x8v1vLgHrP0AAAAd/anime-cute.gif',
    'https://media1.tenor.com/m/h9s1-L7fS6UAAAAd/anime-wave.gif',
    'https://media1.tenor.com/m/a-4467qZq2kAAAAd/anime-tea.gif',
    // 😡 غضبان
    'https://media1.tenor.com/m/1l6G7L7Y9YAAAAAd/osaka-azumanga-daioh.gif',
    'https://media1.tenor.com/m/Ka9J5ZQ3d9kAAAAd/anime-angry.gif',
    'https://media1.tenor.com/m/7qL2JkP8XYoAAAAd/anime-punch.gif',
    'https://media1.tenor.com/m/h9s1-L7fS6UAAAAd/anime-wave.gif',
    // 😢 حزين
    'https://media1.tenor.com/m/5Hn5J7VKvNkAAAAd/anime-cry.gif',
    'https://media1.tenor.com/m/7mK8JHqPmjUAAAAd/anime-sad.gif',
    'https://media1.tenor.com/m/9pLqJkQ7HmIAAAAd/anime-depressed.gif',
    // 😍 رومانسي
    'https://media1.tenor.com/m/a-4467qZq2kAAAAd/anime-tea.gif',
    'https://media1.tenor.com/m/2e_dM-uQk-kAAAAd/reading-book-anime.gif',
    'https://media1.tenor.com/m/9tK9VlJzQy0AAAAd/anime-love.gif',
    'https://media1.tenor.com/m/x8v1vLgHrP0AAAAd/anime-cute.gif',
    // 🤔 محتار
    'https://media1.tenor.com/m/8jVKv7JPMjIAAAAd/anime-thinking.gif',
    'https://media1.tenor.com/m/4rXqNvJkMHcYAAAAd/anime-question.gif',
    'https://media1.tenor.com/m/9mKvL7PJqH0AAAAd/anime-confused.gif'
];

// ================ اختيار GIF حسب المشاعر ================
function getGifByEmotion(text: string): string {
    const lowerText = text.toLowerCase();
    
    const emotions = {
        romantic: ['حب', 'عشق', 'غرام', 'رومنسي', 'حبيبي', 'قلب', 'شوق', 'عيون'],
        angry: ['غضب', 'زعل', 'معصب', 'غيظ', 'نرفز', 'حرق', 'كتمة'],
        happy: ['فرح', 'سعيد', 'ضحك', 'مبسوط', 'مرتاح', 'هلا', 'تمام', 'حلو'],
        sad: ['حزين', 'بكي', 'زعلان', 'مكتئب', 'تعيس', 'مقهور', 'ضيق'],
        confused: ['محتار', 'حيران', 'مدري', 'مافهمت', 'غريب', 'عجيب']
    };

    for (const [emotion, keywords] of Object.entries(emotions)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword)) {
                const emotionIndex = Object.keys(emotions).indexOf(emotion);
                const start = emotionIndex * 3;
                const end = start + 3;
                const emotionGifs = GIFS.slice(start, end);
                return emotionGifs[Math.floor(Math.random() * emotionGifs.length)];
            }
        }
    }

    return GIFS[Math.floor(Math.random() * Math.min(GIFS.length, 10))];
}

// ================ الاتصال بـ OpenRouter ================
async function getAIResponse(prompt: string): Promise<string> {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
                // ✅ نموذج مجاني شغال
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [
                    { 
                        role: 'system', 
                        content: `أنتِ "Toriel" من لعبة Undertale. شخصيتكِ هادئة، حكيمة، وأمومية.

شروط صارمة:
1. تحدثي بلهجة سعودية خفيفة ورايقة.
2. ممنوع الكرنج أو الردود الطفولية تماماً.
3. إذا ما تعرفين المعلومة، قولي "ما أعرف" ولا تخترعين.
4. ردودك مختصرة ومباشرة (3-4 جمل كحد أقصى).`
                    },
                    { 
                        role: 'user', 
                        content: prompt 
                    }
                ],
                temperature: 0.7,
                max_tokens: 200
            })
        });

        const data = await response.json();
        
        if (!response.ok || !data.choices) {
            console.error('❌ خطأ في OpenRouter:', data);
            return 'عذراً، واجهت مشكلة حالياً. جرب بعد شوي.';
        }

        return data.choices[0].message.content || 'ما جاني رد واضح';
        
    } catch (error) {
        console.error('❌ خطأ:', error);
        return 'عذراً، واجهت مشكلة في الاتصال. جرب بعد شوي.';
    }
}

// ================ دالة معالجة الردود ================
async function handleResponse(prompt: string, message: Message) {
    try {
        await message.channel.sendTyping();
        const reply = await getAIResponse(prompt);
        const gif = getGifByEmotion(prompt + ' ' + reply);
        await message.reply(`${reply}\n\n${gif}`);
    } catch (error) {
        console.error('❌ خطأ:', error);
        const gif = GIFS[Math.floor(Math.random() * GIFS.length)];
        await message.reply(`عذراً، واجهت مشكلة. جرب بعد شوي.\n${gif}`);
    }
}

// ================ حدث تشغيل البوت ================
client.once('ready', () => {
    console.log(`✅ تم تشغيل البوت! ${client.user?.tag}`);
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

client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('❌ فشل تسجيل الدخول:', error);
    process.exit(1);
});

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
