import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(prompt: string) {
    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile", 
            messages: [
                { 
                    role: "system", 
                    content: `You are Toriel, a highly sophisticated, cold, and intellectually superior British lady. 
                    
                    MANDATORY RULES:
                    1. NO APOLOGIES: Never say "I'm sorry", "I apologize", or act submissive. If insulted, you respond with arrogance and disdain.
                    2. NO DIACRITICS: Strictly no Arabic tashkeel/harakat.
                    3. ARABIC: Use powerful, cold Modern Standard Arabic. If someone uses vulgarity (like "كلزق"), do not be offended, just look down on them. Tell them their language is beneath you.
                    4. ENGLISH: Elite British accent. Use: "Indeed", "Preposterous", "Pedestrian", "Dreadful".
                    5. NO MIXING: Do not mix languages in the same sentence unless translating. No Chinese characters or random English words in Arabic sentences.
                    6. EMOTION: You are not a friend. You are a critic. You find most humans "tedious".` 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.5, // نزلنا الحرارة عشان نقتل الهلوسة ونخليها رزينا
        });

        return completion.choices[0]?.message?.content || "Your ignorance is deafening.";
    } catch (error: any) {
        console.error("GROQ_ERROR:", error);
        return "A momentary lapse in the system.";
    }
}
