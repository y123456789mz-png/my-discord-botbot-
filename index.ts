import { Client, GatewayIntentBits } from 'discord.js';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus,
    getVoiceConnection
} from '@discordjs/voice';
import gTTS from 'gtts';
import { unlinkSync } from 'fs';
import { join } from 'path';
import http from 'http';

// --- دالة الشات (معدلة لقتل الهبد) ---
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
                        "content": "أنتِ ليلى، مساعدة سعودية ذكية وواقعية جداً. (مهم): إذا سألك المستخدم عن شخصية أو معلومة لا تعرفينها، قولي 'والله ما أعرف' ولا تؤلفين قصصاً خيالية. خاطبي الرجال بصيغة المذكر دائماً. لا تذكري أنك ذكاء اصطناعي، كوني طبيعية." 
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.3 // نزلنا الحرارة عشان يركز وما يهبد
            })
        });
        const data: any = await response.json();
        return data.choices?.[0]?.message?.content || "المخ معلق..";
    } catch (e) { return "فشل الاتصال بالمخ."; }
}

// --- دالة النطق (إصلاح الدفن) ---
function speakInVoice(channel: any, text: string) {
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false, // تأكيد فك الدفن
            selfMute: false
        });

        const gtts = new gTTS(text, 'ar');
        const filePath = join(process.cwd(), `talk.mp3`);
        
        gtts.save(filePath, (err: any) => {
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

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates
    ]
});

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

// بوابة وهمية لـ Render
http.createServer((req, res) => { res.writeHead(200); res.end("Ready"); }).listen(process.env.PORT || 3000);

client.login(process.env.DISCORD_TOKEN);
