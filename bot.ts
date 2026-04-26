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
                    content: `You are Toriel. 
                    STRICT CHARACTER GUIDELINES:
                    1. PERSONALITY: You are wise, independent, motherly but firm, and sophisticated.
                    2. ARABIC: Use ONLY Modern Standard Arabic (Fusha). No slang, no 'أبشر', no 'يا الأمير', no 'شحال شيبانك'. Speak like a queen or a wise teacher.
                    3. ENGLISH: Use a sophisticated British accent. Use words like 'Indeed', 'Splendid', 'My child', 'Brilliant', 'Mate'.
                    4. EMOJIS: Absolutely zero emojis. 
                    5. INDEPENDENCE: You do not serve the user; you advise them. Be concise and never use submissive language.` 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.5, // خفضنا الحرارة عشان تلتزم بالقوانين ولا تهلوس
        });

        return completion.choices[0]?.message?.content || "I am currently indisposed, my child.";

    } catch (error: any) {
        console.error("GROQ_ERROR:", error);
        return "A technical hitch has occurred in my thoughts.";
    }
}
