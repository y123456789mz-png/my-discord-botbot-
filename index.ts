import { Client, GatewayIntentBits } from 'discord.js';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    StreamType,
    AudioPlayerStatus
} from '@discordjs/voice';
import http from 'http';
import { join } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// بوابة وهمية لمنع توقف البوت على منصة Render
http.createServer((req, res) => {
    res.writeHead(200); res.end("Toriel is Elegant & Ready.");
}).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// إعداد ذاكرة القناة (تتذكر آخر 9 رسائل)
interface MessageHistory {
    role: 'user' | 'model';
    parts: [{ text: string }];
}
const memoryStore: Record<string, MessageHistory[]> = {};

function getChannelHistory(channelId: string): MessageHistory[] {
    if (!memoryStore[channelId]) memoryStore[channelId] = [];
    return memoryStore[channelId];
}

function updateChannelHistory(channelId: string, role: 'user' | 'model', content: string) {
    const history = getChannelHistory(channelId);
    history.push({ role, parts: [{ text: content }] });
    if (history.length > 9) history.shift();
}

// دالة تشغيل صوت الترحيب في الـ VC من المجلد الرئيسي للمشروع
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

// دالة الذكاء الاصطناعي باستخدام Gemini الرسمية
async function askGemini(prompt: string, channelId: string): Promise<string> {
    const GEMINI_KEY = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) return "أوه، يبدو أن مفتاح التشغيل الخاص بي مفقود في إعدادات البيئة.";

    try {
        const ai = new GoogleGenerativeAI(GEMINI_KEY);
        const model = ai.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            systemInstruction: `أنتِ Toriel، مساعدة ذكية وأنثوية بطابع ملكي راقٍ جداً، ومستمعة جيدة لكاسبر (Casper).
- تفهمين العامية العربية بطلاقة لكن تردين بالفصحى الراقية دائماً وبشكل مختصر ومباشر وبدون تكلف أو "كرنج".
- إذا لم تكوني متأكدة من معلومة، قولي "لا أعلم" بثقة وثقل وبدون اختلاق إجابات.
- لا تتحدثي بلهجات عامية أبداً، فقط فصحى راقية ومحترمة.`
        });

        const history = getChannelHistory(channelId);
        const chatSession = model.startChat({ history: history });
        const result = await chatSession.sendMessage(prompt);
        
        return result.response.text();
    } catch (error) {
        console.error("❌ خطأ في الاتصال بـ Gemini:", error);
        return "معذرة، واجهتُ صعوبة في معالجة طلبك حالياً.";
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

    // أمر الانضمام للروم الصوتي
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
        const responseText = await askGemini(prompt, message.channel.id);
        
        updateChannelHistory(message.channel.id, 'user', prompt);
        updateChannelHistory(message.channel.id, 'model', responseText);

        await message.reply(responseText);
    } catch (err) {
        console.error(err);
    }
});

client.once('ready', () => {
    console.log(`✅ Toriel المحدثة تعمل الآن بحساب: ${client.user?.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
