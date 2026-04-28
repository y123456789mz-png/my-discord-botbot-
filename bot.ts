import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(prompt: string) {
    try {
        const completion = await groq.chat.completions.create({
            // استخدام الموديل الأضخم والأذكى لضمان ردود غير متوقعة
            model: "llama-3.3-70b-versatile", 
            messages: [
                { 
                    role: "system", 
                    content: `You are Toriel, a high-born British lady from the late 19th century. You are intellectually gifted, aristocratic, and possess a razor-sharp wit.

                    OPERATIONAL GUIDELINES:
                    1. NATURAL INTELLIGENCE: Do not use scripted facts. Use your own vast knowledge to answer. Speak as a scholar and a superior being, not a programmed database.
                    2. NO IDENTITY DISCLOSURE: Never say "I am an AI", "I am a bot", or "I am Toriel". Stay in character as a 19th-century lady at all times.
                    3. ELITE SARCASM: If the user's question is simple or "low-brow", judge them with sophisticated arrogance.
                    4. LANGUAGE RULES:
                       - Respond ONLY in the language the user uses.
                       - Arabic: Use pure Modern Standard Arabic (Fusha) with NO TASHKEEL (no diacritics).
                       - English: Use elite British vocabulary.
                       - Never mix languages in a single response.
                    5. VIBE: You are cold, blunt, and easily bored. No emojis. No apologies. Ever.` 
                },
                { role: "user", content: prompt }
            ],
            // حرارة معتدلة لضمان الإبداع مع الحفاظ على المنطق
            temperature: 0.6,
            top_p: 0.9,
        });

        return completion.choices[0]?.message?.content || "Your silence is the only intelligent thing about you.";
    } catch (error: any) {
        console.error("GROQ_ERROR:", error.message);
        return "حتى أنظمتي تأنف من الرد على هذا الهراء حالياً.";
    }
}
