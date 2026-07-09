import { Client, GatewayIntentBits } from 'discord.js';
import http from 'http';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// بوابة وهمية لمنع توقف البوت على منصة Render
http.createServer((req, res) => {
    res.writeHead(200); res.end("Toriel is Elegant & Ready with Bilingual Stream & GIFs.");
}).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// إعداد ذاكرة القناة لحفظ آخر 9 رسائل
interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
const memoryStore: Record<string, ChatMessage[]> = {};

function getChannelHistory(channelId: string): ChatMessage[] {
    if (!memoryStore[channelId]) memoryStore[channelId] = [];
    return memoryStore[channelId];
}

function updateChannelHistory(channelId: string, role: 'user' | 'assistant', content: string) {
    const history = getChannelHistory(channelId);
    history.push({ role, content });
    if (history.length > 9) history.shift();
}

// دالة جلب رابط GIF عشوائي ولطيف يناسب شخصية Toriel
function getRandomGif(): string {
    const gifs = [
        'https://media.tenor.com/7b58vF_093gAAAAC/toriel-undertale.gif',
        'https://media.tenor.com/vH_fDsc8y8EAAAAC/undertale-toriel.gif',
        'https://media.tenor.com/y4WwB4WzLqMAAAAC/anime-smile.gif',
        'https://media.tenor.com/mYg_Xn9_5gQAAAAC/anime-tea.gif',
        'https://media.tenor.com/VpT7NidgqL4AAAAC/anime-wave.gif'
    ];
    return gifs[Math.floor(Math.random() * gifs.length)];
}

// دالة معالجة الـ Streaming والرد باللغة المطابقة وإرسال الـ GIF
async function handleGroqStream(prompt: string, message: any) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        return message.reply("أوه، يبدو أن مفتاح تشغيل Groq مفقود في إعدادات البيئة.");
    }

    try {
        const groq = new Groq({ apiKey: GROQ_API_KEY });
        const history = getChannelHistory(message.channel.id);

        // توجيهات النظام الصارمة للغة والشخصية
        const systemInstruction = `أنتِ Toriel، مساعدة ذكية وأنثوية بطابع ملكي راقٍ جداً، ومستمعة جيدة لكاسبر (Casper).
- يجب أن تطابقي لغة المستخدم تماماً (Language Matching): إذا تحدث باللغة العربية، جيبي باللغة العربية الفصحى الراقية. وإذا تحدث باللغة الإنجليزية، جيبي باللغة الإنجليزية (English) بأسلوب ملكي ومهذب.
- ردودك دائماً مختصرة، مباشرة، وبدون أي "كرنج" أو تكلف.
- إذا لم تكوني متأكدة من معلومة، قولي "لا أعلم" بثقة وبدون اختلاق إجابات (أو "I do not know" بالإنجليزية).`;

        const messages: ChatMessage[] = [
            { role: 'system', content: systemInstruction },
            ...history,
            { role: 'user', content: prompt }
        ];

        const stream = await groq.chat.completions.create({
            messages: messages,
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: true,
        });

        let fullResponse = '';
        let lastUpdateTime = Date.now();
        
        // إرسال رسالة التفكير الأولية
        const replyMessage = await message.reply("⏳ ...");

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;

            // تحديث النص كل 1.5 ثانية تجنباً للمشاكل
            if (Date.now() - lastUpdateTime > 1500 && fullResponse.trim().length > 0) {
                await replyMessage.edit(fullResponse + " ▌");
                lastUpdateTime = Date.now();
            }
        }

        // التحديث النهائي للرسالة مع إرفاق الـ GIF في سطر جديد
        if (fullResponse.trim().length > 0) {
            const gifUrl = getRandomGif();
            const finalContent = `${fullResponse}\n\n${gifUrl}`;
            
            await replyMessage.edit(finalContent);
            
            // حفظ الحوار في الذاكرة
            updateChannelHistory(message.channel.id, 'user', prompt);
            updateChannelHistory(message.channel.id, 'assistant', fullResponse);
        } else {
            await replyMessage.edit("لم أستطع صياغة رد مناسب حالياً.");
        }

    } catch (error) {
        console.error("❌ خطأ في بث Groq:", error);
        await message.reply("معذرة، واجهتُ صعوبة في معالجة طلبك عبر نظام البث الحالي.");
    }
}

// استقبال الرسائل والشات
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const isMentioned = message.mentions.users.has(client.user!.id);
    if (!isMentioned || message.mentions.everyone) return;

    const prompt = message.content.replace(new RegExp(`<@!?${client.user!.id}>`, 'g'), '').trim();
    if (!prompt) return;

    try {
        await message.channel.sendTyping();
        await handleGroqStream(prompt, message);
    } catch (err) {
        console.error(err);
    }
});

client.once('ready', () => {
    console.log(`✅ Toriel المحدثة تعمل الآن وجاهزة باللغتين والـ GIFs بحساب: ${client.user?.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
