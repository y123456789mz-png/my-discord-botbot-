import { Client, GatewayIntentBits } from 'discord.js';

// --- دالة الشات ---
async function chat(prompt: string) {
    const GROQ_KEY = process.env.GROQ_API_KEY; 

    // فحص إذا المفتاح وصل للكود أصلاً
    if (!GROQ_KEY) return "❌ خطأ: الكود لم يستطع العثور على GROQ_API_KEY في ريندر.";

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_KEY.trim()}`, // .trim() للتخلص من أي مسافات
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "llama3-8b-8192", // غيرت الموديل لنسخة أصغر وأسرع للتجربة
                "messages": [
                    { "role": "system", "content": "أنتِ مساعدة ذكية تجيبين بصيغة المؤنث." },
                    { "role": "user", "content": prompt }
                ]
            })
        });

        const data: any = await response.json();

        if (data.error) return `❌ خطأ من Groq: ${data.error.message}`;
        return data.choices?.[0]?.message?.content || "عذراً، الرد وصل فارغاً من Groq.";

    } catch (e: any) {
        return `❌ فشل الاتصال: ${e.message}`;
    }
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => console.log(`✅ البوت شغال: ${client.user?.tag}`));

client.on('messageCreate', async (message) => {
    if (message.author.bot || !client.user || !message.mentions.has(client.user)) return;

    try {
        const prompt = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
        if (!prompt) return message.reply("تفضلي، كيف يمكنني مساعدتكِ؟");

        await message.channel.sendTyping();
        const response = await chat(prompt);
        await message.reply(response);
    } catch (err) {
        await message.reply("حدث خطأ تقني.");
    }
});

client.login(process.env.DISCORD_TOKEN);
