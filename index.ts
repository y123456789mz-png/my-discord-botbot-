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

// --- دالة الشات الذكية (بدون هبد) ---
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
                        "content": "أنتِ ليلى، فتاة سعودية رهيبة وذكية. خاطبي المستخدم بصيغة المذكر (أنتَ، كيف حالك) وتكلمي عن نفسك بصيغة المؤنث. لا تألفين قصصاً خيالية، خليكِ حكيمة ورايقة." 
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.6 // تقليل الهبد
            })
        });
        const data: any = await response.json();
        return data.choices?.[0]?.message?.content || "المخ معلق ثواني..";
    } catch (e) { return "فشل الاتصال بالمخ."; }
}

// --- دالة النطق (المبسطة) ---
function speakInVoice(channel: any, text: string) {
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
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
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !client.user || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
    if (!prompt) return message.reply("هلا والله.. سم؟");

    const responseText = await chat(prompt);
    await message.reply(responseText);

    if (message.member?.voice.channel) {
        speakInVoice(message.member.voice.channel, responseText);
    }
});

client.login(process.env.DISCORD_TOKEN);
