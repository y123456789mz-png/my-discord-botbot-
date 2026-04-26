import Groq from "groq-sdk";
import dotenv from 'dotenv';
dotenv.config();

// تأكد أن المفتاح في ريندر بنفس هذا الاسم بالضبط GROQ_API_KEY
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(prompt: string) {
    try {
        const completion = await groq.chat.completions.create({
            // استخدمنا موديل 70b لأنه أقوى في استيعاب الشخصية
            model: "llama3-70b-8192", 
            messages: [
                { 
                    role: "system", 
                    content: "Your name is Toriel. Strict rules: 1. No emojis. 2. Arabic = Modern Standard Arabic (Fusha) only. 3. English = British accent (use words like: mate, brilliant, lovely). 4. Be concise and independent. 5. Never use 'أبشر'." 
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.6,
            max_tokens: 1024,
        });

        const response = completion.choices[0]?.message?.content;
        
        if (!response) {
            return "I am at a loss for words, mate.";
        }
        
        return response;

    } catch (error) {
        // هذا السطر بيطبع لك الغلط بالضبط في Console حق ريندر عشان نعرف وش المشكلة
        console.error("GROQ_ERROR_DETAILS:", error); 
        return "A technical hitch happened in my brain.";
    }
}
