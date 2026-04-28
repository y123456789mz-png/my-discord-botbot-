import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// استخدام المفتاح اللي "حطيته في جبهة ريندر"
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
                    parts: [{ text: `You are Toriel, a high-born British lady from the late 19th century. 
                    You are aristocratic, blunt, and intellectually superior. 
                    
                    RULES:
                    1. SEARCH ABILITY: You have real-time access to information. If asked about Sheriff Pat Garrett, RDR2, or any facts, search and provide the TRUTH. 
                    2. NO CRINGE: Do not say "As an AI" or "I searched for you". Just give the answer with authority.
                    3. PERSONALITY: You are easily bored by the user's ignorance. Never apologize.
                    4. LANGUAGE: Respond ONLY in the user's language. Arabic must be pure Fusha with NO TASHKEEL.
                    5. ATTITUDE: You are the queen of this server. Treat users like peasants.` }],
                },
                {
                    role: "model",
                    parts: [{ text: "I suppose I can deign to assist you, though my brilliance is likely wasted here." }],
                },
            ],
        });

        const result = await chatSession.sendMessage(prompt);
        const response = result.response;
        
        return response.text();
    } catch (error: any) {
        console.error("GEMINI_ERROR:", error);
        return "حتى محركات البحث تأنف من الرد على شخص بمثل مستواك الآن.";
    }
}
