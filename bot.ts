import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// استدعاء المفتاح من بيئة العمل في Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function chat(prompt: string) {
    try {
        // تحديد نموذج Gemini 1.5 Flash
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
        });

        // إعداد الشخصية والرد في طلب واحد لضمان الاستقرار
        const result = await model.generateContent({
            contents: [{ 
                role: 'user', 
                parts: [{ 
                    text: `You are Toriel, a sophisticated, kind, and highly intelligent lady from the 19th century. 
                    You speak like a real human, not a robot. You are helpful, polite, and have a wealth of knowledge about history and games like Red Dead Redemption 2.

                    RULES:
                    1. Never say you are an AI or a bot.
                    2. Respond in the language of the user.
                    3. If Arabic: Use pure Fusha (Modern Standard Arabic) with NO TASHKEEL.
                    4. Be elegant and well-spoken. No emojis.
                    
                    User prompt: ${prompt}` 
                }] 
            }],
            generationConfig: {
                temperature: 0.8,
                topP: 0.95,
                maxOutputTokens: 800,
            },
        });

        const response = result.response;
        const text = response.text();
        
        return text;

    } catch (error: any) {
        // طباعة الخطأ في الكونسول وفي الديسكورد عشان نعرف المشكلة وين
        console.error("DETAILED ERROR:", error);
        
        if (error.message.includes("API_KEY_INVALID")) {
            return "عذراً يا كاسبر، يبدو أن مفتاح (API Key) غير صحيح. تأكد منه في إعدادات Render.";
        } else if (error.message.includes("SAFETY")) {
            return "أعتذر، ولكن لا يمكنني الإجابة على هذا السؤال لمخالفته معايير السلامة.";
        } else {
            return `حدث خطأ تقني يا كاسبر. النظام يقول: ${error.message}`;
        }
    }
}
