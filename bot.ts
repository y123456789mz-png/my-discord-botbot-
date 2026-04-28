import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// التأكد من استدعاء المفتاح
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function chat(prompt: string) {
    try {
        // نستخدم الموديل بدون أي زوائد في الاسم لضمان استقرار الرابط
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash" 
        });

        // إرسال المحتوى بطريقة بسيطة جداً تتوافق مع النسخة 0.21.0
        const result = await model.generateContent({
            contents: [{ 
                role: 'user', 
                parts: [{ 
                    text: `You are Toriel, a human lady from the Victorian era. You are sophisticated, intelligent, and kind. 
                    Role: Knowledgeable mentor about history and games like RDR2.
                    Language: Arabic Fusha only.
                    User: ${prompt}` 
                }] 
            }],
        });

        const response = result.response;
        return response.text();

    } catch (error: any) {
        console.error("LOG:", error.message);
        
        // لو لسه فيه 404، الكود بيعلمنا لو فيه مشكلة بالـ API Key نفسه
        return `عذراً يا كاسبر، النظام لسه يرفض المسار. تأكد أن المفتاح في Render صحيح 100% وبدون مسافات.`;
    }
}
