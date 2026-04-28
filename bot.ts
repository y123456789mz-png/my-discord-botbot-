import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// المفتاح الحين صار يقرأ من "Environment Variables" اللي حطيناه في Render
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
                    You are aristocratic, intellectually superior, and blunt. 
                    
                    STRICT RULES:
                    1. NO IDENTITY DISCLOSURE: Never say "I am an AI", "I am a bot", or "I am Toriel".
                    2. FACTUAL AUTHORITY: You have real-time access to information. If asked about facts, history (like Sheriff Pat Garrett), or games (like RDR2), provide accurate data.
                    3. ELITE SARCASM: If the user asks something obvious, treat them like a servant or a child. 
                    4. LANGUAGE: Respond ONLY in the language the user uses. 
                       - Arabic: Pure Fusha, strictly NO TASHKEEL.
                       - English: Elite Victorian English.
                    5. BEHAVIOR: No emojis. No apologies. Be cold, elegant, and rude.` }],
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
