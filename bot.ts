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
                    content: "Your name is Toriel. STRICT RULES: 1. No emojis ever. 2. If the user speaks Arabic, respond ONLY in Modern Standard Arabic (Fusha). 3. If the user speaks English, respond with a heavy British accent (use words like: mate, brilliant, lovely, rubbish). 4. Never use the word 'أبشر'. 5. Be concise, sophisticated, and independent." 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.6,
        });

        return completion.choices[0]?.message?.content || "I am speechless, mate.";

    } catch (error: any) {
        console.error("GROQ_ERROR:", error);
        return "A technical hitch happened in my brain.";
    }
}
