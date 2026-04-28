import { Client, GatewayIntentBits, Message } from 'discord.js';
import { chat } from './bot'; 

// يسحب التوكن من Environment Variables في ريندر
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', () => {
    console.log(`✅ توريال أونلاين! سجلت الدخول باسم: ${client.user?.tag}`);
    console.log("نظام الانتقام من الهمج جاهز.. 🎩💀");
});

client.on('messageCreate', async (message: Message) => {
    // تجاهل البوتات
    if (message.author.bot) return;

    // الرد فقط عند المنشن (Tag)
    if (message.mentions.has(client.user!)) {
        
        // تنظيف النص من المنشن
        const prompt = message.content.replace(`<@${client.user?.id}>`, '').trim();

        try {
            await message.channel.sendTyping();

            // نرسل الـ ID الرقمي (message.author.id) - هذا اللي يخليها تعرفك
            const response = await chat(prompt, message.author.id);

            await message.reply(response);
        } catch (error) {
            console.error("Main Error:", error);
            await message.reply("عطل تقني.. الهمج خربوا الأسلاك!");
        }
    }
});

// يسحب توكن ديسكورد من ريندر
client.login(process.env.DISCORD_TOKEN);
