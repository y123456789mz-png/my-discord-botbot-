import { Client, GatewayIntentBits } from 'discord.js';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    StreamType 
} from '@discordjs/voice';
import http from 'http';
import { join } from 'path';
import ffmpeg from 'ffmpeg-static';

// --- بوابة وهمية لـ Render (عشان الخدمة المجانية ما تفصل) ---
http.createServer((req, res) => {
    res.writeHead(200); res.end("Toriel is Elegant & Ready.");
}).listen(process.env.PORT || 3000);

// --- دالة المخ (الردود الفخمة واللغات) ---
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
                        "content": `أنتِ Toriel، مساعدة ذكية وأنثوية بطابع ملكي راقٍ.
                        - تفهمين العامية العربية لكن تردين بالفصحى الراقية دائماً.
                        - إذا تحدث المستخدم بالعربية، ردي بالعربية الفصحى. وإذا تحدث بالإنجليزية، ردي بالإنجليزية البريطانية.
                        - خاطبي المستخدم بـ "عزيزي" أو "My dear".
                        - لا تستخدمي "Good heavens!" إلا للأخبار الصادمة فعلاً.
                        - لا تذكري أنك ذكاء اصطناعي، تصرفي كسيدة نبيلة.` 
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

// --- دالة تشغيل المقطع الصوتي الخاص بك عند الدخول ---
function playGreeting(connection: any) {
    try {
        // تأكد أن اسم الملف هنا يطابق ملفك المرفوع (مثلاً hey.mp3)
        const resource = createAudioResource(join(process.cwd(), 'hey.mp3'), {
            inputType: StreamType.Arbitrary,
            inlineVolume: true
        });
        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);
    } catch (error) { console.error("Could not play greeting:", error); }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // التحقق من المنشن (تتجاهل everyone وتتفاعل مع منشن توريل فقط)
    const isMentioned = message.mentions.users.has(client.user!.id);
    if (!isMentioned || message.mentions.everyone) return;

    const prompt = message.content.replace(new RegExp(`<@!?${client.user!.id}>`, 'g'), '').trim();

    // أمر الانضمام وتشغيل الـ Hey
    if (prompt.toLowerCase() === 'join' || prompt === '/join' || prompt === 'انضمي') {
        if (message.member?.voice.channel) {
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guildId!,
                adapterCreator: message.guild!.voiceAdapterCreator,
                selfDeaf: false,
            });
            
            playGreeting(connection);
            return message.reply("أنا قادمة فوراً يا عزيزي.. I will be there shortly, my dear.");
        } else {
            return message.reply("عذراً يا عزيزي، يجب أن تكون في قناة صوتية أولاً.");
        }
    }

    if (!prompt) return;

    const responseText = await chat(prompt);
    await message.reply(responseText);
});

client.once('ready', () => console.log(`✅ Toriel is online and ready!`));
client.login(process.env.DISCORD_TOKEN);
