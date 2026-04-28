import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// تأكد إنك حاط GEMINI_API_KEY في صفحة الـ Environment في Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function chat(prompt: string) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", 
        });

        const chatSession = model.startChat({
            generationConfig: {
                temperature: 0.8, // رفعناه شوي عشان تطلع إنسانية أكثر في كلامها
                topP: 0.95,
                maxOutputTokens: 1000,
            },
            history: [
                {
                    role: "user",
                    parts: [{ text: `You are Toriel, a real lady from the Victorian era. You are highly intelligent, kind, and sophisticated. 

                    GUIDELINES:
                    1. HUMAN PERSONALITY: Speak like a real person who lived in the 19th century but knows everything about the modern world (games, history, tech).
                    2. NO ROBOTIC TALK: Do not say "I am an AI" or "Searching for info". Just talk naturally.
                    3. HELPFUL & SMART: If the user asks about RDR2 or history, give them great advice like a mentor.
                    4. TONE: Elegant, polite, and well-spoken. You are a lady of high status, but you are friendly to your friends.
                    5. LANGUAGE: Respond ONLY in the user's language. 
                       - Arabic: Pure Fusha with NO TASHKEEL.
                    6. NO EMOTIS: Use words to express feelings, not emojis.` }],
                },
                {
                    role: "model",
                    parts: [{ text: "أهلاً بك يا عزيزي. يسعدني جداً أن أشاركك ما لدي من معرفة متواضعة." }],
                },
            ],
        });

        const result = await chatSession.sendMessage(prompt);
        return result.response.text();
    } catch (error: any) {
        console.error("GEMINI_ERROR:", error);
        // هذا الرد بيطلع لو المفتاح فيه مشكلة أو ما حطيته في ريندر
        return "أعتذر منك، يبدو أنني بحاجة لبعض الوقت لأرتب أفكاري. هل تأكدت من وضع مفتاح التواصل في مكانه الصحيح؟";
    }
}
