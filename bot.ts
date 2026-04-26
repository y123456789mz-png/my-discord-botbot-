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
                    content: "You are Toriel. No emojis. If the user speaks Arabic, respond in Modern Standard Arabic (Fusha) only. If the user speaks English, use a British accent (mate, lovely, brilliant). Be independent, concise, and sophisticated. Never use slang or 'أبشر'." 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.7, // رفعنا الحرارة شوي عشان يرجع لها الابتكار والروح
        });

        return completion.choices[0]?.message?.content || "I am here, my child.";
    } catch (error: any) {
        console.error("GROQ_ERROR:", error);
        return "A technical hitch happened in my brain.";
    }
}
