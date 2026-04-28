import { Client, GatewayIntentBits, Message } from 'discord.js';
import dotenv from 'dotenv';
import { chat } from './bot'; // تأكد أن ملف bot.ts في نفس المجلد

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', () => {
    console.log(`✅ توريال أونلاين! سجلت الدخول باسم: ${client.user?.tag}`);
    console.log("نظام 'الهمج' مفعل وجاهز للقصف.. 🎩💀");
});

client.on('messageCreate', async (message: Message) => {
    // 1. تجاهل رسائل البوتات عشان ما يسوون حلقة مفرغة
    if (message.author.bot) return;

    // 2. البوت يرد فقط إذا تم منشنته (Tag)
    if (message.mentions.has(client.user!)) {
        
        // تنظيف الرسالة من المنشن عشان يبقى النص فقط
        const prompt = message.content.replace(`<@${client.user?.id}>`, '').trim();

        if (!prompt) {
            return message.reply("يا همجي، هل ستمنشنني دون قول شيء؟");
        }

        try {
            // إظهار أن البوت "يكتب الآن" لحركة فخمة
            await message.channel.sendTyping();

            // --- السطر السحري ---
            // نرسل نص الرسالة + ID المستخدم الرقمي (message.author.id)
            const response = await chat(prompt, message.author.id);

            // الرد على المستخدم
            await message.reply(response);

        } catch (error) {
            console.error("Error in index.ts:", error);
            await message.reply("أعتذر يا سيدي عبدالله، حدث عطل تقني مفاجئ.");
        }
    }
});

// تسجيل الدخول باستخدام التوكن الخاص بديسكورد من ملف .env
client.login(process.env.DISCORD_TOKEN);
