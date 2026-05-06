import { Client, GatewayIntentBits } from 'discord.js';
import { chat } from './chat.js'; 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// رسالة التأكيد في الـ Logs
client.once('ready', () => {
    console.log(`✅ تم تشغيل البوت بنجاح! السيرفرات جاهزة.`);
    console.log(`Logged in as: ${client.user?.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (client.user && message.mentions.has(client.user)) {
        try {
            const prompt = message.content
                .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
                .trim();

            if (!prompt) {
                return message.reply("أهلاً بكِ، أنا هنا لمساعدتكِ. كيف يمكنني خدمتكِ اليوم؟");
            }

            await message.channel.sendTyping();
            const response = await chat(prompt);
            await message.reply(response);

        } catch (error) {
            console.error("❌ حدث خطأ أثناء معالجة الرسالة:", error);
            await message.reply("عذراً، واجهت مشكلة فنية بسيطة.");
        }
    }
});

// التعامل مع أخطاء تسجيل الدخول
const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error("❌ خطأ: لم يتم العثور على DISCORD_TOKEN في متغيرات البيئة!");
    process.exit(1); // يخلي ريندر يعطيك إيرور واضح بدل ما يقفل بصمت
}

client.login(token).catch(err => {
    console.error("❌ فشل تسجيل الدخول إلى ديسبورد:", err);
    process.exit(1);
});
