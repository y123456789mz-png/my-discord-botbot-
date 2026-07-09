import { Client, GatewayIntentBits } from 'discord.js';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    StreamType
} from '@discordjs/voice';
import http from 'http';
import { join } from 'path';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// بوابة وهمية لمنع توقف البوت على منصة Render
http.createServer((req, res) => {
    res.writeHead(200); res.end("Toriel is Elegant & Ready with Groq Stream.");
}).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
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

// دالة تشغيل صوت الترحيب في الـ VC
function playGreetingSound(connection: any) {
    try {
        const player = createAudioPlayer();
        const soundPath = join(process.cwd(), 'hey.mp3'); 
        const resource = createAudioResource(soundPath, {
            inputType: StreamType.Arbitrary,
        });

        player.play(resource);
        connection.subscribe(player);

        console.log("📡 [Toriel Sound] تم تشغيل صوت الترحيب بنجاح.");
    } catch (error) {
        console.error("❌ [Toriel Sound] فشل تشغيل الصوت:", error);
    }
}

// دالة معالجة الـ Streaming وإرسال الرد للديسكورد أولاً بأول
async function handleGroqStream(prompt: string, message: any) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        return message.reply("أوه، يبدو أن مفتاح تشغيل Groq مفقود في إعدادات البيئة.");
    }

    try {
        const groq = new Groq({ apiKey: GROQ_API_KEY });
        const history = getChannelHistory(message.channel.id);

        const systemInstruction = `أنتِ Toriel، مساعدة ذكية وأنثوية بطابع ملكي راقٍ جداً، ومستمعة جيدة لكاسبر (Casper).
- تفهمين العامية العربية بطلاقة لكن تردين بالفصحى الراقية دائماً وبشكل مختصر ومباشر وبدون تكلف أو "كرنج".
- إذا لم تكوني متأكدة من معلومة، قولي "لا أعلم" بثقة وثقل وبدون اختلاق إجابات.
- لا تتحدثي بلهجات عامية أبداً، فقط فصحى راقية ومحترمة.`;

        const messages: ChatMessage[] = [
            { role: 'system', content: systemInstruction },
            ...history,
            { role: 'user', content: prompt }
        ];

        // بدء بث الرد (Stream) تماماً مثل إعداداتك
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
        
        // إرسال رسالة أولية فارغة ليتم التعديل عليها أثناء البث
        const replyMessage = await message.reply("⏳ جاري صياغة الرد...");

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;

            // تحديث الرسالة في الديسكورد كل 1.5 ثانية تجنباً للـ Rate Limit (تعليق الديسكورد)
            if (Date.now() - lastUpdateTime > 1500 && fullResponse.trim().length > 0) {
                await replyMessage.edit(fullResponse + " ▌");
                lastUpdateTime = Date.now();
            }
        }

        // التحديث النهائي الصافي بعد اكتمال البث
        if (fullResponse.trim().length > 0) {
            await replyMessage.edit(fullResponse);
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

// حدث دخول الأعضاء للـ VC للترحيب الصوتي
client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.member?.user.bot) return;

    if (!oldState.channelId && newState.channelId) {
        if (newState.channel && newState.channel.members.has(client.user!.id)) {
            const connection = joinVoiceChannel({
                channelId: newState.channelId,
                guildId: newState.guild.id,
                adapterCreator: newState.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });
            console.log(`👤 العضو دخل الروم، جاري تشغيل الترحيب...`);
            setTimeout(() => {
                playGreetingSound(connection);
            }, 2500);
        }
    }
});

// استقبال الرسائل والشات
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const isMentioned = message.mentions.users.has(client.user!.id);
    if (!isMentioned || message.mentions.everyone) return;

    const prompt = message.content.replace(new RegExp(`<@!?${client.user!.id}>`, 'g'), '').trim();

    if (prompt.toLowerCase() === 'join' || prompt === 'انضمي') {
        if (message.member?.voice.channel) {
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guildId!,
                adapterCreator: message.guild!.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });
            setTimeout(() => {
                playGreetingSound(connection);
            }, 2000);
            return message.reply("أنا قادمة فوراً إلى القناة الصوتية.");
        } else {
            return message.reply("عذراً، يجب أن تكون في قناة صوتية أولاً لأتمكن من الانضمام إليك.");
        }
    }

    if (!prompt) return;

    try {
        await message.channel.sendTyping();
        // استدعاء دالة البث الجديدة المحدثة بموديل llama-4 الجديد
        await handleGroqStream(prompt, message);
    } catch (err) {
        console.error(err);
    }
});

client.once('ready', () => {
    console.log(`✅ Toriel تعمل الآن بنظام Groq Stream بحساب: ${client.user?.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
