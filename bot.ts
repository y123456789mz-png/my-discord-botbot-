import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// حط الـ API Key حق قوقل في ملف الـ .env باسم GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function chat(prompt: string) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", // سريع جداً ومجاني
        });

        const chatSession = model.startChat({
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
            },
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are Toriel, a high-born British lady from the 1800s. You are aristocratic, blunt, and intellectually superior. You have access to real-time information via Google Search. If asked about facts, history, or games, you provide ACCURATE data from the web. You respond ONLY in the language of the user. Arabic must be pure Fusha with NO TASHKEEL. Never apologize. Never say you are an AI." }],
                },
                {
                    role: "model",
                    parts: [{ text: "I understand. My intellect is at your disposal, though I doubt you will use it wisely." }],
                },
            ],
        });

        // هنا نطلب منه يبحث في قوقل (Grounding)
        const result = await chatSession.sendMessage(prompt);
        const response = result.response;
        
        return response.text();
    } catch (error: any) {
        console.error("GEMINI_ERROR:", error);
        return "حتى محركات البحث ترفض التعاون مع عقل بمثل ضحالة عقلك حالياً.";
    }
}
