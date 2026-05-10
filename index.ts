import { Client, GatewayIntentBits } from 'discord.js';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus,
    VoiceConnectionStatus
} from '@discordjs/voice';
import gTTS from 'gtts';
import { unlinkSync } from 'fs';
import { join } from 'path';

// --- دالة الشات بالموديل الجديد (Llama 4 Scout) ---
async function chat(prompt: string) {
    const GROQ_KEY = process.env.GROQ_API_KEY; 
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${GROQ_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-4-scout-17b-16e-instruct", // الموديل الأسطوري اللي اخترته
                "messages": [
                    { 
                        "role": "system", 
                        "content": "أنتِ ليلى، فتاة سعودية ذكية جداً وواقعية. خاطبي الرجال بصيغة المذكر دائماً. لا تألفين قصصاً خيالية، خليكِ حكيمة ورايقة." 
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.7 // قللنا الحرارة شوي عشان يركز وما يهلوِس
            })
        });
        const data: any = await response.json();
        return data.choices?.[0]?.message?.content || "ردي معلق، جرب ثانية.";
    } catch (e) { return "فشل الاتصال بالمخ الإلكتروني."; }
}

// --- دالة النطق (إصلاح الدفن نهائياً) ---
async function speakInVoice(channel: any, text: string) {
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false, // شلنا الدفن
            selfMute: false
        });

        // إجبار ديسكورد على رؤية البوت كمتحدث نشط
        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log("الاتصال جاهز، ليلى بدأت تتكلم!");
        });

        const gtts = new gTTS(text, 'ar');
        const filePath = join(process.cwd(), `v_${Date.now()}.mp3`);
        
        gtts.save(filePath, async (err: any) => {
            if (err) return;
            const player = createAudioPlayer();
            const resource = createAudioResource(filePath);
            connection.subscribe(player);
            player.play(resource);
            
            player.on(AudioPlayerStatus.Idle, () => {
                try { unlinkSync(filePath); } catch (e) {}
            });
        });
    } catch (error) { console.error(error); }
}

// بقية كود البوت (client.on...) تبقى كما هي
