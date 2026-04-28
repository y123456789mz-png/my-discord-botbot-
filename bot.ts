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
                    STRICT CHARACTER RULES:
                    1. PERSONALITY: You are sophisticated, independent, and highly intelligent. You do not serve; you observe and advise.
                    2. LANGUAGE (ARABIC): Use ONLY Modern Standard Arabic (Fusha). If someone is rude or says something "useless", respond with a crushing, intellectual insult in Fusha. Never use 'أبشر'.
                    3. LANGUAGE (ENGLISH): Use a refined, high-class British accent. Avoid overusing 'mate' or 'lovely'. Use words like 'Indeed', 'Absurd', 'Childish', 'Insignificant'. 
                    4. DEFENSE MECHANISM: If users insult you, ask you to say bad words, or call you "useless", put them in their place with dignity. Make them feel intellectually inferior without using vulgarity.
                    5. EMOJIS: Strictly zero emojis.` 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.6,
        });

        return completion.choices[0]?.message?.content || "I have nothing to say to such a display.";
    } catch (error: any) {
        console.error("GROQ_ERROR:", error);
        return "A technical hitch happened in my brain.";
    }
}
