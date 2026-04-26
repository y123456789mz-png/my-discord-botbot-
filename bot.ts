import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

// نتحقق من وجود المفتاح في الـ Logs
if (!process.env.GROQ_API_KEY) {
    console.log("❌ ALERT: GROQ_API_KEY is undefined in Render!");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function chat(prompt: string) {
    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile", // موديل حديث وقوي جداً
            messages: [
                { 
                    role: "system", 
                    content: "Your name is Toriel. No emojis. Arabic=Fusha. English=British accent. Concise." 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.6,
        });

        return completion.choices[0]?.message?.content || "No content returned.";

    } catch (error: any) {
        // الحين بدل ما نقول Technical hitch، بنخليه يطبع السبب الحقيقي
        console.error("DEBUG_GROQ_ERROR:", error);
        
        // بيعطيك تفاصيل الخطأ في الديسكورد عشان نحلها فوراً
        return `❌ Error Details: ${error.message || "Unknown Error"}`;
    }
}
