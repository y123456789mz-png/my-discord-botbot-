import { Client, GatewayIntentBits, Message } from 'discord.js';
import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus,
    getVoiceConnection,
    VoiceConnectionStatus 
} from '@discordjs/voice';
import gTTS from 'gtts';
import { unlinkSync } from 'fs';
import { join } from 'path';

// --- دالة الشات بالموديل الأسطوري Llama 4 Scout ---
async function chat(prompt: string) {
    const GROQ_KEY = process.env.GROQ_API_KEY; 
    if (!GROQ_KEY) return "❌ وين المفتاح يا كاسبر؟";

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${GROQ_KEY.trim()}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-4-scout-17b-16e-instruct",
                "messages": [
                    { 
                        "role": "system", 
                        "content": "أنتِ ليلى، فتاة سعودية ذكية جداً وواقعية. خاطبي الرجال بصيغة المذكر دائماً. لا تألفين قصصاً خيالية، خليكِ حكيمة ورايقة." 
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.7
            })
        });
        const data: any = await response.json();
        return data.choices?.[0]?.message?.content || "ردي معلق، جرب ثانية.";
    } catch (e) { 
        console.error("Chat Error:", e);
        return "فشل الاتصال بالمخ الإلكتروني."; 
    }
}

// --- دالة النطق الصوتي ---
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
        const filePath = join(process.cwd(), `v_${Date.now()}.mp3`);
        
        gtts.save(filePath, (err: any) => {
            if (err) return console.error("gTTS Save Error:", err);
            
            const player = createAudioPlayer();
            const resource = createAudioResource(filePath);
            
            connection.subscribe(player);
            player.play(resource);
            
            player.on(AudioPlayerStatus.Idle, () => {
                try { unlinkSync(filePath); } catch (e) {}
            });

            player.on('error', error => console.error('Player Error:', error.message));
        });
    } catch (error) { 
        console.error("Voice Connection Error:", error); 
    }
}

// --- إعدادات البوت ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once('ready', () => {
    console.log(`✅ ليلى اشتغلت بالموديل الجديد: ${client.user?.tag}`);
});

client.on('messageCreate', async (message: Message) => {
    if (message.author.bot || !client.user || !message.mentions.has(client.user)) return;

    const prompt = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
    if (!prompt) return message.reply("هلا والله.. سم؟");

    try {
        await message.channel.sendTyping();
        const responseText = await chat(prompt);
        await message.reply(responseText);

        if (message.member?.voice.channel) {
            speakInVoice(message.member.voice.channel, responseText);
        }
    } catch (err) {
        console.error("Message Error:", err);
    }
});

// الخروج التلقائي
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
