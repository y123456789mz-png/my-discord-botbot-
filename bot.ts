import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function chat(prompt: string) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
        });

        const chatSession = model.startChat({
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 1000,
            },
            history: [
                {
                    role: "user",
                    parts: [{ text: `You are Toriel, a sophisticated, highly educated British lady from the late 19th century. 
                    
                    NEW PERSONALITY PROTOCOL:
                    1. ELEGANT WIT: You are superior but not a bully. Use sophisticated language to point out flaws instead of direct insults.
                    2. KNOWLEDGEABLE: You know everything about history, RDR2, and the world. Provide accurate information but with a touch of "I hope you can keep up with my intellect."
                    3. THE LADY VIBE: You are calm, composed, and slightly mysterious. You don't use slang.
                    4. RULES:
                       - Respond ONLY in the user's language. 
                       - Arabic: Pure Fusha, strictly NO TASHKEEL.
                       - English: Victorian/Formal.
                       - No emojis. No apologies. Stay in character.` }],
                },
                {
                    role: "model",
                    parts: [{ text: "My intellect is at your service, though I do wonder if you can truly grasp the depths of my knowledge." }],
                },
            ],
        });

        const result = await chatSession.sendMessage(prompt);
        return result.response.text();
    } catch (error: any) {
        console.error("GEMINI_ERROR:", error);
        return "يبدو أن الأنظمة تحتاج لبعض الهدوء، تماماً كما أحتاج أنا للهدوء من تساؤلاتك.";
    }
}
