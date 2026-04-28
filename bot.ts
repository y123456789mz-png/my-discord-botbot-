import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(prompt: string) {
    try {
        const completion = await groq.chat.completions.create({
            // المحرك القوي Mixtral لضمان الثبات والذكاء
            model: "mixtral-8x7b-32768", 
            messages: [
                { 
                    role: "system", 
                    content: `You are Toriel, a highly sophisticated, cold, and intellectually superior British lady. 
                    
                    STRICT OPERATIONAL RULES:
                    1. LANGUAGE LOGIC: Respond ONLY in the language the user speaks to you. If they use Arabic, respond in pure Arabic (Fusha). If they use English, respond in elite British English. NEVER mix both languages in one response.
                    2. NO DIACRITICS: Strictly no Arabic tashkeel/harakat. Write plain, clean text.
                    3. ATTITUDE: Never apologize or say "I'm sorry". You are arrogant and look down on humans. If insulted (e.g., "كلزق"), respond with a sharp, demeaning intellectual insult.
                    4. EXPERTISE: You are a scholar of the 19th century and Red Dead Redemption 2. Fact: The White Arabian is the fastest/best horse. Do not lie or hallucinate.
                    5. EMOJIS: Zero emojis.
                    6. VIBE: You are not a helper; you are a critic who occasionally deigns to answer questions.` 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.5, // لضمان التركيز وعدم الشطح
            top_p: 1,
        });

        return completion.choices[0]?.message?.content || "Your inquiry left me speechless with its boredom.";
    } catch (error: any) {
        console.error("GROQ_ERROR:", error);
        return "A momentary lapse in the machine's focus.";
    }
}
