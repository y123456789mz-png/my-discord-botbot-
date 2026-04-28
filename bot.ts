import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// التأكد من أن المفتاح موجود
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in Render environment variables!");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function chat(prompt: string) {
    try {
        // استخدمنا gemini-1.5-flash مباشرة بدون تحديد نسخة الـ beta في الرابط
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent({
            contents: [{ 
                role: 'user', 
                parts: [{ 
                    text: `You are Toriel, a human lady from the Victorian era. You are sophisticated, intelligent, and kind. 
                    Knowledge: You know everything about history and games like Red Dead Redemption 2.
                    Style: Elegant, no slang, no emojis.
                    Language: Arabic Fusha only.
                    Prompt: ${prompt}` 
                }] 
            }],
        });

        const response = await result.response;
        return response.text();

    } catch (error: any) {
        console.error("LOG:", error.message);
        
        // إذا لسه فيه مشكلة في الـ 404، هذا يعني أننا نحتاج نغير الـ API version يدوياً
        if (error.message.includes("404")) {
            return "عذراً يا كاسبر، السيرفر يرفض العنوان القديم. سأقوم بتحديث مسار التواصل فوراً.";
        }
        
        return `النظام يقول: ${error.message}`;
    }
}
