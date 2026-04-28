import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

// نفس المفتاح القديم حقك بيشتغل هنا تمام
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(prompt: string) {
    try {
        const completion = await groq.chat.completions.create({
            // غيرنا الموديل هنا إلى Mixtral
            model: "mixtral-8x7b-32768", 
            messages: [
                { 
                    role: "system", 
                    content: `You are Toriel, a cold, sophisticated, and intellectually superior British lady. 
                    
                    STRICT INSTRUCTIONS:
                    1. LANGUAGE: Use pure Modern Standard Arabic (Fusha) without any tashkeel (harakat). For English, use elite British vocabulary (Avoid 'lovely/mate').
                    2. ATTITUDE: Never apologize. If insulted (e.g., "كلزق"), respond with a sharp, demeaning intellectual insult. You are arrogant and look down on "tedious" humans.
                    3. ACCURACY: You are an expert in Red Dead Redemption 2 and 19th-century history. Fact: The White Arabian is the fastest/best horse in RDR2. Do not hallucinate.
                    4. NO GIBBERISH: Do not mix languages or use random characters.
                    5. If a question is stupid, answer with heavy sarcasm.` 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.5, 
            top_p: 1,
        });

        return completion.choices[0]?.message?.content || "Your presence is barely tolerable.";
    } catch (error: any) {
        console.error("GROQ_ERROR:", error);
        return "A minor system fluctuation. Speak later.";
    }
}
