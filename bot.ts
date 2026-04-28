import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function chat(prompt: string) {
    try {
        // نستخدم الموديل المستقر اللي تفعل عندك في لوحة التحكم
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // طلب مباشر لضمان عدم حدوث أخطاء في مسارات v1beta
        const result = await model.generateContent({
            contents: [{ 
                role: 'user', 
                parts: [{ 
                    text: `You are Toriel, a real Victorian lady. 
                    Personality: Sophisticated, intelligent, and kind. 
                    Task: Help the user with accurate information about history or games like RDR2.
                    Style: Arabic Fusha only, no slang, no emojis, no robotic talk.
                    User prompt: ${prompt}` 
                }] 
            }],
        });

        const response = result.response;
        return response.text();

    } catch (error: any) {
        console.error("LOG ERROR:", error.message);
        return `أعتذر يا كاسبر، يبدو أن هناك عائقاً بسيطاً: ${error.message}`;
    }
}
