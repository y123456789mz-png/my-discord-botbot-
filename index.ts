import { Client, GatewayIntentBits, Message } from 'discord.js';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus,
    getVoiceConnection,
    StreamType
} from '@discordjs/voice';
import gTTS from 'gtts';
import { unlinkSync } from 'fs';
import { join } from 'path';
import http from 'http';

// --- 1. البوابة الوهمية عشان Render المجاني ما يقفل البوت ---
http.createServer((req, res) => {
    res.writeHead(200);
    res.end("ليلى شغالة يا كاسبر.. روقنا!");
}).listen(process.env.PORT || 3000);

// --- 2. دالة الشات (النسخة الرايقة - ليلى) ---
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
                        "content": "أنتِ ليلى، فتاة سعودية رهيبة وذكية. خاطبي الرجال بصيغة المذكر (أنتَ، كيف حالك) وتكلمي عن نفسك بصيغة المؤنث. إذا سألك عن شيء لا تعرفينه قولي 'ما أعرف' ولا تألفين." 
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.5 
            })
        });
        const data: any = await response.json();
        return data.choices?.[0]?.message?.content || "المخ معلق شوي..";
    } catch (e) { return "فشل الاتصال بالمخ."; }
}

// --- 3. دالة النطق (حل مشكلة الصمت والدفن) ---
function speakInVoice(channel: any, text: string) {
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });

        const gtts = new gTTS(text, 'ar');
        const filePath = join(process.cwd(), `voice_temp.mp3`);
        
        gtts.save(filePath, (err: any) => {
            if (err) return console.error("Error saving gTTS:", err);

            const player = createAudioPlayer();
            // استخدام StreamType.Arbitrary لضمان عمل ffmpeg-static
            const resource = createAudioResource(filePath, {
                inputType: StreamType.Arbitrary,
                inlineVolume: true
            });

            connection.subscribe(player);
            player.play(resource);

            player.on(AudioPlayerStatus.Idle, () => {
                try { unlinkSync(filePath); } catch (e) {}
            });
            
            player.on('error', error => console.error("Player Error:", error));
        });
    } catch (error) { console.error("Voice Error:", error); }
}

// --- 4. إعداد البوت وتشغيله ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once('ready', () => console.log(`✅ ليلى انطلقت: ${client.user?.tag}`));

client.on('messageCreate', async (message) => {
    if (message.author.bot || !client.user || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
    if (!prompt) return;

    const responseText = await chat(prompt);
    await message.reply(responseText);

    if (message.member?.voice.channel) {
        speakInVoice(message.member.voice.channel, responseText);
    }
});

client.login(process.env.DISCORD_TOKEN);
