import { Client, GatewayIntentBits } from 'discord.js';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    StreamType,
    AudioPlayerStatus,
    VoiceConnectionStatus
} from '@discordjs/voice';
import http from 'http';
import { join } from 'path';
import ffmpeg from 'ffmpeg-static';

// --- 1. بوابة وهمية لـ Render (للمحافظة على استمرارية الخدمة المجانية) ---
http.createServer((req, res) => {
    res.writeHead(200); res.end("Toriel is Elegant & Ready.");
}).listen(process.env.PORT || 3000);

// --- 2. دالة المخ (الذكاء الفخم، اللغات، والرزانة) ---
async function chat(prompt: string) {
    const GROQ_KEY = process.env.GROQ_API_KEY; 
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                "model": "meta-llama/llama-4-scout-17b-16e-instruct",
                "messages": [
                    { 
                        "role": "system", 
                        "content": `أنتِ Toriel، مساعدة ذكية وأنثوية بطابع ملكي راقٍ جداً.
                        - تفهمين العامية العربية بطلاقة لكن تردين بالفصحى الراقية دائماً.
                        - إذا تحدث المستخدم بالعربية، ردي بالفصحى. وإذا تحدث بالإنجليزية، ردي بالإنجليزية البريطانية الكلاسيكية.
                        - خاطبي المستخدم بـ "عزيزي" أو "My dear".
                        - لا تستخدمي "Good heavens!" إلا للأخبار الصادمة أو الفاجعة فعلاً، ولا تكرريها كثيراً.
                        - أنتِ سيدة نبيلة ولبقة، لا تذكري أنكِ ذكاء اصطناعي.` 
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.5 
            })
        });
        const data: any = await response.json();
        return data.choices?.[0]?.message?.content || "I beg your pardon, my dear?";
    } catch (e) { return "عذراً يا عزيزي، حدث خطأ في النظام."; }
}

// --- 3. دالة تشغيل الترحيب الصوتي (حل مشكلة عدم التشغيل) ---
function playGreeting(connection: any) {
    connection.once(VoiceConnectionStatus.Ready, () => {
        // ننتظر ثانية كاملة لضمان استقرار الاتصال قبل بدء الصوت
        setTimeout(() => {
            try {
                const player = createAudioPlayer();
                
                // استخدام ffmpeg-static لضمان تحويل الملف وصلاحيته للتشغيل في ديسكورد
                const resource = createAudioResource(join(process.cwd(), 'hey.mp3'), {
                    inputType: StreamType.Arbitrary,
                    inlineVolume: true
                });

                connection.subscribe(player);
                player.play(resource);

                player.on(AudioPlayerStatus.Playing, () => console.log("✅ Toriel is saying Hey!"));
                player.on('error', error => console.error("Audio Player Error:", error.message));
                
            } catch (error) {
                console.error("Failed to play greeting file:", error);
            }
        }, 1000); 
    });
}

// --- 4. إعدادات البوت والمنشن والأوامر ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // فلتر المنشن: تجاهل everyone وتفاعل مع منشن توريل فقط
    const isMentioned = message.mentions.users.has(client.user!.id);
    if (!isMentioned || message.mentions.everyone) return;

    const prompt = message.content.replace(new RegExp(`<@!?${client.user!.id}>`, 'g'), '').trim();
