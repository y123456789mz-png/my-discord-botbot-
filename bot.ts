import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// التأكد من وجود المفتاح
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing!");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function chat(prompt: string) {
    try {
        // استخدمنا gemini-1.5-flash بدون إضافات لضمان الوصول للرابط الصحيح
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash" 
        });

        // إرسال الطلب بطريقة مبسطة جداً لتجنب أخطاء المسارات
        const result = await model.generateContent(`You are Toriel, a real human lady from the Victorian era. You are highly intelligent, kind, and sophisticated. Use only Arabic Fusha. User asks: ${prompt}`);
        
        const response = result.response;
        return response.text();

    } catch (error: any) {
        console.error("LOG:", error.message);
        
        // لو لسه فيه مشكلة، الكود بيعطيك السبب الصريح
        if (error.message.includes("404")) {
            return "عذراً يا كاسبر، يبدو أن هناك تحديثاً في مسارات قوقل، سأحاول المزامنة مجدداً.";
        }
        
        return `النظام يقول: ${error.message}`;
    }
}
