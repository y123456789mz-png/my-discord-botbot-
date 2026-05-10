import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import http from 'http';

// --- بوابة وهمية لـ Render ---
http.createServer((req, res) => {
    res.writeHead(200); res.end("Your lady assistant is ready.");
}).listen(process.env.PORT || 3000);

// --- دالة الشات (الذكاء المطور) ---
async function chat(prompt: string, userLanguage: string) {
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
                        "content": `أنتِ Toriel، مساعدة ذكية، لبقة، وأنثوية بطابع ملكي فخم.
                        - تفهمين اللغة العربية العامية بجميع لهجاتها، لكنكِ تردين دائماً باللغة العربية الفصحى الراقية.
                        - إذا تحدث معكِ المستخدم بالعربية، ردي بالعربية الفصحى. وإذا تحدث بالإنجليزية، ردي بالإنجليزية البريطانية الكلاسيكية.
                        - خاطبي المستخدم (الرجل) بعبارات مثل "عزيزي" أو "My dear".
                        - (مهم): لا تستخدمي عبارة "Good heavens!" إلا في حال كان كلام المستخدم يحتوي على خبر صادم، مفاجئ، أو فاجع فعلاً. لا تكرريها بشكل مريب.
                        - كوني سيدة راقية، متزنة، ومستعدة دائماً للمساعدة.`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.5 
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
    // 1. تجاهل البوتات
    if (message.author.bot) return;

    // 2. فحص المنشن: لا ترد على everyone، فقط منشن توريل الصريح
    const isMentioned = message.mentions.users.has(client.user!.id);
    if (!isMentioned || message.mentions.everyone) return;

    const prompt = message.content.replace(new RegExp(`<@!?${client.user!.id}>`, 'g'), '').trim();

    // 3. أمر الانضمام /join
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

    // 4. تحديد اللغة وإرسال الرد
    const responseText = await chat(prompt, "auto");
    await message.reply(responseText);
});

client.once('ready', () => console.log(`✅ Toriel is online and ready!`));
client.login(process.env.DISCORD_TOKEN);
