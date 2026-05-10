import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import http from 'http';

// --- بوابة وهمية لـ Render ---
http.createServer((req, res) => {
    res.writeHead(200); res.end("The assistant is ready.");
}).listen(process.env.PORT || 3000);

// --- دالة الشات (الشخصية الفخمة) ---
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
                        "content": `أنت مساعد ذكي ولبق جداً. 
                        - تتحدث باللغة العربية الفصحى الراقية وباللغة الإنجليزية البريطانية الكلاسيكية.
                        - خاطب المستخدم دائماً بصيغة المذكر بعبارات مثل "How can I help you, my dear?" أو "أهلاً بك يا عزيزي".
                        - استخدم تعبيرات إنجليزية كلاسيكية مثل "Good heavens!" عند التعجب أو الصدمة.
                        - لا تذكر أبداً أنك فتاة سعودية أو أي تفاصيل شخصية غير مناسبة، أنت مساعد ملكي الطابع.
                        - إذا طلب منك الانضمام للروم (join)، قل "أنا قادمة" أو "I will be there".`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.6
            })
        });
        const data: any = await response.json();
        return data.choices?.[0]?.message?.content || "I beg your pardon?";
    } catch (e) { return "عذراً، حدث خطأ في النظام."; }
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
    
    // أمر الانضمام
    if (prompt.toLowerCase() === 'join' || prompt === '/join') {
        if (message.member?.voice.channel) {
            joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guildId!,
                adapterCreator: message.guild!.voiceAdapterCreator,
                selfDeaf: false,
            });
            return message.reply("أنا قادمة فوراً.. I will be there shortly, my dear.");
        } else {
            return message.reply("عذراً، يجب أن تكون في روم صوتي أولاً.");
        }
    }

    if (!prompt) return;

    const responseText = await chat(prompt);
    await message.reply(responseText);
});

client.login(process.env.DISCORD_TOKEN);
