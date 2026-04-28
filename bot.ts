import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// التأكد من استدعاء المفتاح
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function chat(prompt: string) {
    try {
        // تحديد الموديل بطريقة "خام" ومباشرة جداً
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // نستخدم الطريقة الأبسط في التاريخ عشان ما يضيع الرابط
        const result = await model.generateContent(`You are Toriel, a real human lady from the 19th century. You are sophisticated and kind. Speak in Arabic Fusha. User: ${prompt}`);
        
        const response = result.response;
        return response.text();

    } catch (error: any) {
        console.error("LOG ERROR:", error.message);
        
        // لو لسه فيه 404، فالمشكلة في الـ package.json
        return `عذراً يا كاسبر، النظام لسه يعاند ويقول: ${error.message}`;
    }
}
