import { Client, GatewayIntentBits } from 'discord.js';
import { chat } from './chat.ts'; // لاحظ أضفنا .ts هنا

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`✅ البوت جاهز ومنطلق! سجلت الدخول باسم: ${client.user?.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (client.user && message.mentions.has(client.user)) {
        try {
            const prompt = message.content
                .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
                .trim();

            if (!prompt) return message.reply("أهلاً بكِ، كيف يمكنني مساعدتكِ؟");

            await message.channel.sendTyping();
            const response = await chat(prompt);
            await message.reply(response);

        } catch (error) {
            console.error("❌ خطأ في معالجة الرسالة:", error);
            await message.reply("عذراً، حدث خطأ فني بسيط.");
        }
    }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error("❌ التوكن مفقود!");
    process.exit(1);
}

client.login(token).catch(err => {
    console.error("❌ فشل الدخول:", err);
    process.exit(1);
});
