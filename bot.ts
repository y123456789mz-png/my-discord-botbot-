import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

// محاولة جلب المفتاح بأكثر من طريقة للتأكد
const apiKey = process.env.GROQ_API_KEY;

const groq = new Groq({ 
    apiKey: apiKey 
});

export async function chat(prompt: string) {
    try {
        // استخدمنا موديل Mixtral لأنه أسرع وأقل مشاكل في الاتصال
        const completion = await groq.chat.completions.create({
            model: "mixtral-8x7b-32768", 
            messages: [
                { 
                    role: "system", 
                    content: "Your name is Toriel. No emojis. Arabic = Modern Standard Arabic (Fusha). English = British accent. Concise. Never use 'أبشر'." 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
        });

        return completion.choices[0]?.message?.content || "I am silent, mate.";

    } catch (error: any) {
        // طباعة الخطأ في الـ Logs حق ريندر عشان لو فشل نعرف ليه
        console.error("DETAILED_ERROR:", error.message);
        
        // إذا كان الخطأ بسبب المفتاح
        if (error.message.includes("401")) return "Wrong API Key, mate.";
        // إذا كان بسبب الموديل
        if (error.message.includes("404")) return "Model not found.";
        
        return "A technical hitch happened in my brain.";
    }
}
