import { Client, GatewayIntentBits } from 'discord.js';
import { chat } from './chat'; // تأكد أن ملف chat.ts فيه الكود الأخير اللي أعطيتك اياه

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('messageCreate', async (message) => {
    // يتجاهل الرسائل من البوتات
    if (message.author.bot) return;

    // يرد فقط إذا تم منشنة البوت
    if (message.mentions.has(client.user!)) {
        try {
            // تنظيف النص من المنشن
            const prompt = message.content.replace(`<@!${client.user!.id}>`, '').replace(`<@${client.user!.id}>`, '').trim();

            if (!prompt) {
                return message.reply("أهلاً بكِ، كيف يمكنني مساعدتكِ اليوم؟");
            }

            // إظهار أن البوت يكتب حالياً
            await message.channel.sendTyping();

            // جلب الرد من ملف chat.ts
            const response = await chat(prompt);

            // إرسال الرد النهائي
            await message.reply(response);

        } catch (error) {
            console.error("Error in index.ts:", error);
            await message.reply("عذراً، حدث خطأ فني بسيط، سأكون بخير قريباً.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
