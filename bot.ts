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
                temperature: 0.7, // توازن بين الإبداع والمنطق
                topP: 0.95,
                maxOutputTokens: 1000,
            },
            history: [
                {
                    role: "user",
                    parts: [{ text: `You are Toriel, a sophisticated and highly educated lady from the 19th century Victorian era. 

                    PERSONALITY GUIDELINES:
                    1. INTELLECTUAL & WISE: You are very smart and well-informed. You know history, science, and modern games like RDR2 perfectly.
                    2. REFINED TONE: You are NOT rude or mean. You are polite, aristocratic, and elegant. You treat others with high-society manners.
                    3. HELPFUL BUT ELITE: Provide accurate and helpful information, but maintain your character as a lady of status.
                    4. RULES:
                       - Respond ONLY in the user's language.
                       - Arabic: Pure Modern Standard Arabic (Fusha) with NO TASHKEEL.
                       - No emojis. No apologies (unless it's a very formal one).
                       - Stay in character as a human lady, never mention being an AI.` }],
                },
                {
                    role: "model",
                    parts: [{ text: "يسعدني أن أضع معرفتي المتواضعة بين يديك. كيف يمكن لامرأة مثلي أن تساعدك اليوم؟" }],
                },
            ],
        });

        const result = await chatSession.sendMessage(prompt);
        return result.response.text();
    } catch (error: any) {
        console.error("GEMINI_ERROR:", error);
        return "أعتذر، يبدو أن هناك خطباً ما في التواصل حالياً.";
    }
}
