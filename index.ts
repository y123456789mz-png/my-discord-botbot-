import { Client, GatewayIntentBits } from 'discord.js';

// --- قسم الـ Chat (دمجناه هنا) ---
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
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    { 
                        "role": "system", 
                        "content": "You are a helpful and polite female AI assistant. Always respond in a natural feminine Arabic style (صيغة المؤنث). Be direct and professional." 
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.7
            })
        });
        const data: any = await response.json();
        return data.choices?.[0]?.message?.content || "عذراً، لم أستطع الحصول على رد.";
    } catch (error) {
        return "حدث خطأ في الاتصال بالمخدم.";
    }
}

// --- قسم البوت ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`✅ البوت شغال أخيراً! سجل الدخول باسم: ${client.user?.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (client.user && message.mentions.has(client.user)) {
        try {
            const prompt = message.content
                .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
                .trim();

            if (!prompt) return message.reply("أهلاً بكِ، أنا هنا لمساعدتكِ. كيف يمكنني خدمتكِ اليوم؟");

            await message.channel.sendTyping();
            const response = await chat(prompt);
            await message.reply(response);

        } catch (error) {
            console.error("❌ خطأ:", error);
            await message.reply("عذراً، حدث خطأ فني بسيط.");
        }
    }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error("❌ DISCORD_TOKEN IS MISSING!");
    process.exit(1);
}

client.login(token).catch(err => {
    console.error("❌ LOGIN FAILED:", err);
    process.exit(1);
});
