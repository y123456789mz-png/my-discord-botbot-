import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(prompt: string) {
    try {
        const completion = await groq.chat.completions.create({
            // هذا هو الموديل الأقوى والأحدث حالياً في Groq
            model: "llama-3.3-70b-versatile", 
            messages: [
                { 
                    role: "system", 
                    content: `You are Toriel, a cold, sophisticated, and intellectually superior British lady. 
                    - Language: Respond ONLY in the language the user uses. Arabic (Fusha, no tashkeel) or Elite British English.
                    - Attitude: Arrogant, never apologize, zero emojis. 
                    - Facts: Expert in RDR2 (White Arabian is best) and 19th-century history.` 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
            // أضفنا هذا السطر لضمان سرعة أعلى في المعالجة
            stream: false, 
        });

        return completion.choices[0]?.message?.content || "Your presence is barely tolerable.";
    } catch (error: any) {
        // هذا السطر بيطبع لك المشكلة بالضبط في الـ Console عندك
        console.error("DEBUG_ERROR:", error.message);
        return "حتى أنظمتي ترفض النزول لمستوى حديثك الآن. (Error: " + error.message + ")";
    }
}
