import { Client, GatewayIntentBits } from 'discord.js';
import http from 'http';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// بوابة وهمية لمنع توقف البوت على منصة Render
http.createServer((req, res) => {
    res.writeHead(200); res.end("Toriel is Elegant & Ready with Klipy Native GIFs.");
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

// روابط أنمي مباشرة وصافية من محرك Klipy الجديد المتوافق مع ديسكورد 100%
function getKlipyAnimeGif(): string {
    const gifs = [
        'https://klipy.com/gifs/osaka-spin-3',
        'https://klipy.com/gifs/anime-tea-drinking',
        'https://klipy.com/gifs/anime-wave-hello',
        'https://klipy.com/gifs/anime-smile-happy',
        'https://klipy.com/gifs/anime-reading-book'
    ];
    return gifs[Math.floor(Math.random() * gifs.length)];
}

// دالة معالجة الـ Streaming والرد باللغة المطابقة
async function handleGroqStream(prompt: string, message: any) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        return message.reply("أوه، يبدو أن مفتاح تشغيل Groq مفقود في إعدادات البيئة.");
    }

    try {
        const groq = new Groq({ apiKey: GROQ_API_KEY });
        const history = getChannelHistory(message.channel.id);

        const systemInstruction = `أنتِ Toriel، مساعدة ذكية وأنثوية بطابع ملكي راقٍ جداً، ومستمعة جيدة لكاسبر (Casper).
- يجب أن تطابقي لغة المستخدم تماماً: إذا تحدث باللغة العربية، جيبي باللغة العربية الفصحى الراقية. وإذا تحدث باللغة الإنجليزية، جيبي باللغة الإنجليزية بأسلوب ملكي ومهذب.
- ردودك دائماً مختصرة، مباشرة، وبدون أي "كرنج" أو تكلف.
- إذا لم تكوني متأكدة من معلومة، قولي "لا أعلم" بثقة وبدون اختلاق إجابات.`;

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
        
        const replyMessage = await message.reply("⏳ ...");

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;

            if (Date.now() - lastUpdateTime > 1500 && fullResponse.trim().length > 0) {
                await replyMessage.edit({ content: fullResponse + " ▌" });
                lastUpdateTime = Date.now();
            }
        }

        if (fullResponse.trim().length > 0) {
            // ندمج رد اللاما مع رابط الـ Klipy المباشر عشان ديسكورد يفتحه كـ Native GIF فورا
            const gifUrl = getKlipyAnimeGif();
            const finalMessage = `${fullResponse}\n${gifUrl}`;

            await replyMessage.edit({ content: finalMessage });
            
            updateChannelHistory(message.channel.id, 'user', prompt);
            updateChannelHistory(message.channel.id, 'assistant', fullResponse);
        } else {
            await replyMessage.edit({ content: "لم أستطع صياغة رد مناسب حالياً." });
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
    console.log(`✅ Toriel جاهزة ومحدثة بنظام Klipy الفعلي بحساب: ${client.user?.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
