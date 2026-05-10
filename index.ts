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

// --- دالة الشات (تعديل أسلوب الخطاب) ---
async function chat(prompt: string) {
    const GROQ_KEY = process.env.GROQ_API_KEY; 
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    { 
                        "role": "system", 
                        "content": "أنتِ ليلى، فتاة سعودية رهيبة وذكية ورايقة. خاطبي المستخدم دائماً بصيغة المذكر (مثلاً: كيف حالك، أنت، وش سويت) إلا إذا عرفتِ يقيناً أنها بنت. تكلمي عن نفسكِ دائماً بصيغة المؤنث (أنا سويت، أنا فكرت). خليكِ طبيعية وبدون رسميات زايدة." 
                    },
                    { "role": "user", "content": prompt }
                ]
            })
        });
        const data: any = await response.json();
        return data.choices?.[0]?.message?.content || "معليش، المخ علق ثواني.";
    } catch (e) { return "فشل الاتصال بالمخ."; }
}

// --- دالة النطق (إلغاء الدفن) ---
async function speakInVoice(channel: any, text: string) {
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false, // شلنا السماعة المشطوبة هنا
            selfMute: false
        });

        const gtts = new gTTS(text, 'ar');
        const filePath = join(process.cwd(), `voice_${Date.now()}.mp3`);
        
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

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once('ready', () => console.log(`✅ ليلى رجعت وبتضبط أسلوبها!`));

client.on('messageCreate', async (message) => {
    if (message.author.bot || !client.user || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
    if (!prompt) return message.reply("هلا والله.. سم؟");

    const responseText = await chat(prompt);
    await message.reply(responseText);

    if (message.member?.voice.channel) {
        await speakInVoice(message.member.voice.channel, responseText);
    }
});

// خروج تلقائي
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
