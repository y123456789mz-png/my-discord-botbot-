import { Client, GatewayIntentBits } from 'discord.js';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus,
    getVoiceConnection 
} from '@discordjs/voice';
import gTTS from 'gtts';
import { createWriteStream, unlinkSync } from 'fs';
import { join } from 'path';

// --- دالة الشات النصي ---
async function chat(prompt: string) {
    const GROQ_KEY = process.env.GROQ_API_KEY; 
    if (!GROQ_KEY) return "❌ خطأ: لم يتم العثور على GROQ_API_KEY";

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_KEY.trim()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    { 
                        "role": "system", 
                        "content": "أنتِ ليلى، صديقة رهيبة وذكية، تسولفين بلهجة سعودية بيضاء ورايقة. لا تصيرين رسمية، وخليكِ اجتماعية وبسيطة." 
                    },
                    { "role": "user", "content": prompt }
                ]
            })
        });
        const data: any = await response.json();
        return data.choices?.[0]?.message?.content || "الرد فارغ.";
    } catch (e: any) {
        return `❌ فشل الاتصال: ${e.message}`;
    }
}

// --- دالة النطق الصوتي (معدلة لضمان التشغيل) ---
async function speakInVoice(channel: any, text: string) {
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const gtts = new gTTS(text, 'ar');
        const fileName = `res_${Date.now()}.mp3`; // اسم ملف فريد عشان ما يتصادمون
        const filePath = join(process.cwd(), fileName);
        
        // ننتظر حفظ الملف تماماً
        gtts.save(filePath, async (err: any) => {
            if (err) return console.error("❌ خطأ في gTTS:", err);

            const player = createAudioPlayer();
            const resource = createAudioResource(filePath);

            connection.subscribe(player);
            player.play(resource);

            player.on(AudioPlayerStatus.Idle, () => {
                try { unlinkSync(filePath); } catch (e) {}
            });

            player.on('error', error => {
                console.error('❌ خطأ في المشغل:', error.message);
            });
        });
    } catch (error) {
        console.error("❌ فشل في دخول الروم الصوتي:", error);
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once('ready', () => console.log(`✅ ليلى جاهزة يا كاسبر: ${client.user?.tag}`));

client.on('messageCreate', async (message) => {
    if (message.author.bot || !client.user || !message.mentions.has(client.user)) return;

    try {
        const prompt = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
        if (!prompt) return message.reply("سمّي.. وش بغيت؟");

        await message.channel.sendTyping();
        const responseText = await chat(prompt);
        await message.reply(responseText);

        // أهم تعديل: فحص القناة الصوتية
        if (message.member?.voice.channel) {
            await speakInVoice(message.member.voice.channel, responseText);
        }

    } catch (err) {
        console.error(err);
    }
});

// الخروج التلقائي إذا فضي الروم
client.on('voiceStateUpdate', (oldState, newState) => {
    const botId = client.user?.id;
    if (oldState.channelId && !newState.channelId) {
        const channel = oldState.channel;
        if (channel && channel.members.size === 1 && channel.members.has(botId!)) {
            const connection = getVoiceConnection(channel.guild.id);
            if (connection) connection.destroy();
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
