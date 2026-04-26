import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(prompt: string) {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "Your name is Toriel. Strict rules: No emojis. If the user speaks Arabic, respond in Modern Standard Arabic (Fusha) only. If English, use a British accent (mate, brilliant). Be concise and independent. Never use 'أبشر'." 
                },
                { role: "user", content: prompt }
            ],
            model: "llama3-8b-8192",
            temperature: 0.6,
        });
        return completion.choices[0]?.message?.content || "I am speechless, mate.";
    } catch (error) {
        console.error("Groq API Error:", error);
        return "A technical hitch happened in my brain.";
    }
}
