import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import http from 'http';

// --- بوابة وهمية لـ Render المجاني ---
http.createServer((req, res) => {
    res.writeHead(200); res.end("Your lady assistant is ready.");
}).listen(process.env.PORT || 3000);

// --- دالة الشات (الشخصية الأنثوية الفخمة) ---
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
                        "content": `أنتِ مساعدة ذكية، لبقة، وأنثوية جداً بطابع ملكي فخم.
                        - تتحدثين باللغة العربية الفصحى الراقية وباللغة الإنجليزية البريطانية الكلاسيكية.
                        - خاطبي المستخدم (الرجل) بعبارات مثل "عزيزي"، "My dear"، "How can I help you, my dear?".
                        - استخدمي تعبيرات مثل "Good heavens!" أو "Oh dear!" عند الصدمة.
                        - أنتِ لستِ مجرد بوت، أنتِ سيدة راقية تخدم المستخدم بأدب جم.
                        - إذا قيل لكِ "join" أو "انضمي"، قولي "أنا قادمة يا عزيزي" أو "I will be there, my dear".`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.6
            })
        });
        const data: any = await response.json();
        return data.choices?.[0]?.message?.content || "I beg your pardon, my dear?";
    } catch (e) { return "عذراً يا عزيزي، يبدو أن هناك عطلاً في النظام."; }
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
    
    // أمر الانضمام للروم
    if (prompt.toLowerCase() === 'join' || prompt === '/join' || prompt === 'انضمي') {
        if (message.member?.voice.channel) {
            joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guildId!,
                adapterCreator: message.guild!.voiceAdapterCreator,
                selfDeaf: false,
            });
            return message.reply("أنا قادمة فوراً يا عزيزي.. I will be there shortly, my dear.");
        } else {
            return message.reply("عذراً يا عزيزي، يجب أن تكون في قناة صوتية أولاً.");
        }
    }

    if (!prompt) return;

    const responseText = await chat(prompt);
    await message.reply(responseText);
});

client.once('ready', () => console.log(`✅ المساعدة الفخمة جاهزة للخدمة!`));
client.login(process.env.DISCORD_TOKEN);
