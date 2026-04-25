import { GoogleGenerativeAI } from "@google/generative-ai";

export async function chat(history: any[]): Promise<string> {
  // 1. روح طلع مفتاح جديد تماماً "Fresh" من مشروع جديد في AI Studio
  const apiKey = "AIzaSyAi-Pw8vRyNJ-_h1t2Frj4t8i9JmBhnr5E"; 
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // جربنا gemini-1.5-flash كخيار أول
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chatSession = model.startChat({
      history: history.slice(0, -1).map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chatSession.sendMessage(history[history.length - 1].content);
    const response = await result.response;
    return response.text();

  } catch (err: any) {
    // إذا فشل الفلاش، بنجرب ننزل للنسخة المضمونة فوراً
    return `يا كاسبر صار فيه خطأ: ${err.message}`;
  }
}
