import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// التأكد من استدعاء المفتاح
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function chat(prompt: string) {
    try {
        // تغيير استدعاء الموديل لنسخة أكثر استقراراً
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const result = await model.generateContent(`You are Toriel, a sophisticated Victorian lady. Be smart, helpful, and human. Respond in Arabic Fusha. User: ${prompt}`);
        
        const response = await result.response;
        return response.text();

    } catch (error: any) {
        console.error("DEBUG:", error.message);
        
        // رسالة مساعدة لو لسه فيه مشكلة في الربط
        if (error.message.includes("404")) {
            return "عذراً يا كاسبر، يبدو أن هناك مشكلة في إصدار النموذج. جاري محاولة الإصلاح تلقائياً.";
        }
        
        return `النظام يقول: ${error.message}`;
    }
}
