import { Client, GatewayIntentBits } from 'discord.js';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus 
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
                    { "role": "system", "content": "أنتِ مساعدة ذكية تجيبين بصيغة المؤنث بلهجة سعودية رايقة." },
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

// --- دالة النطق الصوتي ---
function speakInVoice(channel: any, text: string) {
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const gtts = new gTTS(text, 'ar');
        const filePath = join(process.cwd(), 'response.mp3');
        
        gtts.save(filePath, (err: any) => {
            if (err) return console.error("❌ خطأ في حفظ الملف الصوتي:", err);

            const player = createAudioPlayer();
            const resource = createAudioResource(filePath);

            player.play(resource);
            connection.subscribe(player);

            player.on(AudioPlayerStatus.Idle, () => {
                try { unlinkSync(filePath); } catch (e) {} // حذف الملف بعد الانتهاء
            });
        });
    } catch (error) {
        console.error("❌ فشل في دخول الروم الصوتي:", error);
    }
}

// --- محرك البوت الرئيسي ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates // ضروري جداً للصوت
    ]
});

client.once('ready', () => console.log(`✅ البوت شغال يا عبدالله: ${client.user?.tag}`));

client.on('messageCreate', async (message) => {
    // تجاهل البوتات والرسائل اللي ما فيها منشن
    if (message.author.bot || !client.user || !message.mentions.has(client.user)) return;

    try {
        const prompt = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
        if (!prompt) return message.reply("أهلاً بكِ، سمّي.. وش بغيتي؟");

        await message.channel.sendTyping();
        
        // 1. جلب الرد النصي من AI
        const responseText = await chat(prompt);
        
        // 2. الرد في الشات
        await message.reply(responseText);

        // 3. إذا كان المستخدم في روم صوتي.. اخليه يتكلم
        if (message.member?.voice.channel) {
            speakInVoice(message.member.voice.channel, responseText);
        }

    } catch (err) {
        console.error(err);
    }
});

client.login(process.env.DISCORD_TOKEN);
