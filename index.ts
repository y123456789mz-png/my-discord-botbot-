import http from 'http';
import { Client, GatewayIntentBits, Message } from 'discord.js';
import { chat } from './bot'; 

// --- 1. سيرفر وهمي عشان ريندر ما يطفي البوت (Fix Port Binding Error) ---
http.createServer((req, res) => {
    res.write("Toriel is Online and Active!");
    res.end();
}).listen(10000); 

// --- 2. إعدادات بوت الديسكورد ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', () => {
    console.log(`✅ توريال سجلت الدخول باسم: ${client.user?.tag}`);
    console.log("🚀 نظام الأسياد والهمج جاهز للعمل!");
});

client.on('messageCreate', async (message: Message) => {
    // تجاهل رسائل البوتات
    if (message.author.bot) return;

    // الرد فقط عند المنشن (Tag)
    if (message.mentions.has(client.user!)) {
        
        // تنظيف الرسالة من المنشن
        const prompt = message.content.replace(`<@${client.user?.id}>`, '').trim();

        try {
            // حركة فخمة: البوت يكتب الآن...
            await message.channel.sendTyping();

            // --- السطر الذهبي (إرسال الـ ID الرقمي بدقة) ---
            // نرسل الـ author.id وليس الـ username
            const response = await chat(prompt, message.author.id);

            // الرد على الرسالة
            await message.reply(response);

        } catch (error) {
            console.error("حدث خطأ في ملف الانديكس:", error);
            // لو أنت اللي مكلمها وصار خطأ، ترد بأدب
            if (message.author.id === "1403809465156898926") {
                await message.reply("أعتذر يا سيدي عبدالله، حدث خلل فني في محركي.");
            } else {
                await message.reply("انصرف يا همجي، أصابني عطل بسبب كثرة حماقتكم.");
            }
        }
    }
});

// --- 3. تسجيل الدخول باستخدام المتغيرات اللي حطيتها في ريندر ---
client.login(process.env.DISCORD_TOKEN);
