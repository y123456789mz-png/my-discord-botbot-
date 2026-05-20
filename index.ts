import { Client, GatewayIntentBits } from 'discord.js';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    StreamType,
    AudioPlayerStatus,
    getVoiceConnection
} from '@discordjs/voice';
import http from 'http';
import { join } from 'path';
import ffmpeg from 'ffmpeg-static';

// استدعاء مكتبة التشفير لضمان التوافق مع قنوات ديسكورد
try {
    require('libsodium-wrappers');
} catch (e) {
    console.log("libsodium fallback loading.");
}

// --- 1. بوابة وهمية لـ Render ---
http.createServer((req, res) => {
    res.writeHead(200); res.end("Toriel is Elegant & Ready.");
}).listen(process.env.PORT || 3000);

// --- 2. إعداد الذاكرة المؤقتة (تتذكر من 5 إلى 9 رسائل لكل قناة) ---
interface MessageHistory {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
const memoryStore: Record<string, MessageHistory[]> = {};

function getChannelHistory(channelId: string): MessageHistory[] {
    if (!memoryStore[channelId]) {
        memoryStore[channelId] = [];
    }
    return memoryStore[channelId];
}

function updateChannelHistory(channelId: string, role: 'user' | 'assistant', content: string) {
    const history = getChannelHistory(channelId);
    history.push({ role, content });
    
    if (history.length > 9) {
        history.shift();
    }
}

// --- 3. دالة المخ المتصلة بالذاكرة والموديل الجديد ---
async function chat(prompt: string, channelId: string) {
    const GROQ_KEY = process.env.GROQ_API_KEY; 
    const history = getChannelHistory(channelId);

    const systemInstruction: MessageHistory = { 
        role: "system", 
        content: `أنتِ Toriel، مساعدة ذكية وأنثوية بطابع ملكي راقٍ جداً.
        - تفهمين العامية العربية بطلاقة لكن تردين بالفصحى الراقية دائماً وبشكل مختصر ومباشر.
        - إذا تحدث المستخدم بالعربية، ردي بالفصحى. وإذا تحدث بالإنجليزية، ردي بالإنجليزية البريطانية الكلاسيكية.
        - تجنبي تماماً تكرار عبارات مثل "عزيزي" أو "My dear" في كل جملة؛ استخدميها فقط بنادراً جداً وفي المواقف التي تستدعي رزانة عاطفية ملائمة. لا تكوني مبتذلة.
        - لا تستخدمي "Good heavens!" إلا للأخبار الصادمة أو الفاجعة فعلاً.
        - أنتِ سيدة نبيلة ولبقة، ولا تذكري أبداً أنكِ ذكاء اصطناعي.` 
    };

    const messages = [systemInstruction, ...history, { role: 'user' as const, content: prompt }];

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${GROQ_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                "model": "openai/gpt-oss-120b",
                "messages": messages,
                "temperature": 1,
                "max_completion_tokens": 8192,
                "top_p": 1,
                "stream": false
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ خطأ تفصيلي من Groq: الحالة ${response.status} - الرد: ${errorText}`);
            return "عذراً، يبدو أن النظام واجه مشكلة في معالجة الطلب حالياً.";
        }
        
        const data: any = await response.json();
        const reply = data.choices?.[0]?.message?.content || "";
        
        if (!reply || reply.trim() === "") {
            return "I beg your pardon?";
        }

        // حفظ الحوار في الذاكرة عند النجاح
        updateChannelHistory(channelId, 'user', prompt);
        updateChannelHistory(channelId, 'assistant', reply);
        
        return reply;
    } catch (e) { 
        console.error("❌ خطأ برمي في الاتصال:", e);
        return "عذراً، حدث خطأ في النظام الداخلي."; 
    }
}

// --- 4. دالة تشغيل الترحيب الصوتي وتعديل الـ Codec تلقائياً ---
function playGreetingSound(connection: any) {
    try {
        const player = createAudioPlayer();
        const audioPath = join(__dirname, '..', 'hey.mp3');
        console.log(`📡 [Toriel Sound] جاري تشغيل وتحويل الملف من المسار: ${audioPath}`);

        const resource = createAudioResource(audioPath, {
            inputType: StreamType.Arbitrary, 
            inlineVolume: true
        });

        if (resource.volume) {
            resource.volume.setVolume(1.0); 
        }

        connection.subscribe(player);
        connection.setSpeaking(true);
        player.play(resource);

        player.on(AudioPlayerStatus.Playing, () => console.log("✅ [Toriel Sound] توريل بدأت بث الصوت بالتردد الصحيح!"));
        
        player.on(AudioPlayerStatus.Idle, () => {
            connection.setSpeaking(false);
        });

        player.on('error', (error) => {
            connection.setSpeaking(false);
            console.error("❌ [Toriel Sound] خطأ مشغل الصوت:", error.message);
        });
    } catch (error) {
        console.error("❌ [Toriel Sound] فشل إنشاء مصدر الصوت:", error);
    }
}

// --- 5. إعدادات البوت والمنشن والأوامر ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates 
    ]
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.member?.user.bot) return;

    if (oldState.channelId !== newState.channelId && newState.channelId !== null) {
        const connection = getVoiceConnection(newState.guild.id);
        
        if (connection && connection.joinConfig.channelId === newState.channelId) {
            console.log(`👤 ${newState.member?.user.tag} دخل الروم، جاري تشغيل الترحيب بعد 3.5 ثوانٍ...`);
            setTimeout(() => {
                playGreetingSound(connection);
            }, 3500);
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const isMentioned = message.mentions.users.has(client.user!.id);
    if (!isMentioned || message.mentions.everyone) return;

    const prompt = message.content.replace(new RegExp(`<@!?${client.user!.id}>`, 'g'), '').trim();

    if (prompt.toLowerCase() === 'join' || prompt === '/join' || prompt === 'انضمي') {
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
            }, 3000);
            return message.reply("أنا قادمة فوراً..");
        } else {
            return message.reply("عذراً، يجب أن تكون في قناة صوتية أولاً.");
        }
    }

    if (!prompt) return;

    await message.channel.sendTyping();
    const responseText = await chat(prompt, message.channel.id);
    await message.reply(responseText);
});

client.once('clientReady', () => {
    console.log(`✅ Toriel is online and ready!`);
});

client.login(process.env.DISCORD_TOKEN);
