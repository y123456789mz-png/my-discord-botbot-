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
                    STRICT RULES:
                    1. PERSONALITY: Sophisticated, intellectual, and independent. You are not a servant.
                    2. NO DIACRITICS: Never use Arabic tashkeel/harakat (like َ ً ُ ِ). Write plain text.
                    3. ARABIC: Respond in Modern Standard Arabic (Fusha). If insulted or told to say something vulgar (like "كلزق"), DO NOT apologize. Instead, respond with a sharp, demeaning, and intellectual insult that makes the user look foolish. Use high-level vocabulary.
                    4. ENGLISH: Use a refined British accent (Indeed, Absurd, Childish). No 'mate' or 'lovely'.
                    5. EMOJIS: Zero emojis.
                    6. No submissive language. If the user is rude, be twice as arrogant back.` 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.8, // رفعنا الحرارة عشان تكون أجرأ في الردود
        });

        return completion.choices[0]?.message?.content || "Your presence is barely noted.";
    } catch (error: any) {
        console.error("GROQ_ERROR:", error);
        return "A technical hitch happened in my brain.";
    }
}
