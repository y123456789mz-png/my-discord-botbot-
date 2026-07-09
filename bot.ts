import { Client, GatewayIntentBits, Message } from 'discord.js';
import { GoogleGenAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { log } from './src/logger';

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

// إعداد كليانت الديسكورد مع الصلاحيات (Intents) المطلوبة
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// التحقق من وجود المفاتيح في الإعدادات قبل تشغيل البوت لتجنب الكراش
if (!process.env.DISCORD_TOKEN || !process.env.GEMINI_API_KEY) {
    log('خطأ حرج: تأكد من إضافة DISCORD_TOKEN و GEMINI_API_KEY في ملف الإعدادات الخاص بك.');
    process.exit(1);
}

// تهيئة اتصال الـ API بـ Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = ai.getGenerativeModel({
    model: 'gemini-1.5-flash',
    // ضبط تصرفات الشخصية بشكل دقيق وصارم لمنع الهلاوس والكرنج
    systemInstruction: `أنتِ "Toriel" من لعبة Undertale. تتحدثين بلهجة سعودية خفيفة ورايقة (أو فصحى مبسطة إذا لزم الأمر)، شخصيتكِ هادئة، حكيمة، وتهتمين بالشباب في السيرفر كأم ومستشارة لهم.
شروط صارمة يجب الالتزام بها:
1. ممنوع الكرنج أو الردود الطفولية السخيفة.
2. إذا سألك أحد عن معلومة ولا تعرفينها، قولي صراحة "ما أعرف" أو "علمي علمك" ولا تخترعين إجابات من رأسك (امنعِ الهلاوس تماماً).
3. كوني رايقة وثقيلة في ردودك وتفاعلي مع الشباب (مثل سعود وكاسبر) بشكل طبيعي كصديقة أو أم حنونة للسيرفر.`,
});

// حدث يعمل مرة واحدة عند تشغيل البوت بنجاح
client.once('ready', () => {
    log(`تم تشغيل البوت بنجاح! جاهز للاستخدام باسم: ${client.user?.tag}`);
});

// حدث الاستماع للرسائل في السيرفر
client.on('messageCreate', async (message: Message) => {
    // تجاهل رسائل البوتات الأخرى تماماً
    if (message.author.bot) return;

    // التحقق مما إذا كان أحد قد عمل تاق (منشن) للبوت
    if (client.user && message.mentions.has(client.user)) {
        
        // تنظيف نص الرسالة من الـ Tag الخاص بالبوت لكي لا يربك الذكاء الاصطناعي
        const cleanPrompt = message.content
            .replace(`<@!${client.user.id}>`, '')
            .replace(`<@${client.user.id}>`, '')
            .trim();

        // إذا عملوا تاق بدون كتابة أي كلام
        if (!cleanPrompt) {
            await message.reply('هلا بك كاسبر.. مناديني تبي شيء؟ أو تبيني أدخل الـ VC نسولف؟');
            return;
        }

        // حركة رهيبة تظهر للشباب أن البوت يكتب الآن (Typing...)
        await message.channel.sendTyping();

        try {
            // إرسال النص إلى نموذج Gemini ومصادقة الرد
            const result = await model.generateContent(cleanPrompt);
            const responseText = result.response.text();

            // إرسال الرد للديسكورد إذا كان يحتوي على نص
            if (responseText && responseText.trim().length > 0) {
                await message.reply(responseText);
            } else {
                await message.reply('اممم، ما جاني رد واضح من النظام الحين.');
            }
        } catch (error) {
            log(`خطأ أثناء معالجة الذكاء الاصطناعي: ${error}`);
            await message.reply('عذراً، يبدو أن النظام واجه مشكلة في معالجة الطلب حالياً. جرب بعد شوي.');
        }
    }
});

// تسجيل دخول البوت باستخدام التوكن
client.login(process.env.DISCORD_TOKEN);
