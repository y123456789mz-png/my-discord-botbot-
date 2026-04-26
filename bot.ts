import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

// نتحقق من وجود المفتاح أول ما يشتغل البوت
if (!process.env.GROQ_API_KEY) {
    console.error("❌ MISSING GROQ_API_KEY IN RENDER ENVIRONMENT VARIABLES");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(prompt: string) {
    try {
        const completion = await groq.chat.completions.create({
            // هذا الموديل مستقر جداً وسريع
            model: "gemma2-9b-it", 
            messages: [
                { 
                    role: "system", 
                    content: "Your name is Toriel. Strict rules: No emojis. If the user speaks Arabic, respond in Modern Standard Arabic (Fusha) only. If English, use a British accent (mate, brilliant). Concise only." 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 500,
        });

        const reply = completion.choices[0]?.message?.content;
        return reply || "I am speechless, mate.";

    } catch (error: any) {
        // بنطبع الخطأ الحقيقي في الـ Logs حق ريندر عشان لو خربت نعرف السبب
        console.error("GROQ_RAW_ERROR:", error.message);
        
        // إذا كان المفتاح غلط بيعطيك هذا الرد
        if (error.status === 401) return "Wrong API Key, mate. Check your Render settings.";
        
        return "A technical hitch happened in my brain.";
    }
}
