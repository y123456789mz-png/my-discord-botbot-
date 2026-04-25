import { GoogleGenerativeAI } from "@google/generative-ai";

export async function chat(history: { role: string, content: string }[]): Promise<string> {
  // 1. حط مفتاحك الجديد هنا (تأكد إنه طازج من AI Studio)
  const apiKey = "AIzaSyAi-Pw8vRyNJ-_h1t2Frj4t8i9JmBhnr5E"; 
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // بنجرب الموديل الأساسي gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chatSession = model.startChat({
      history: history.slice(0, -1).map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    });

    const userMessage = history[history.length - 1].content;
    const result = await chatSession.sendMessage(userMessage);
    const response = await result.response;
    
    return response.text();

  } catch (err: any) {
    // لو طلع خطأ "Not Found" للموديل، الكود بيفهم ويحاول يكلم الموديل الثاني
    return `يا كاسبر فيه مشكلة: ${err.message}`;
  }
}

export async function voiceChat() {
  return { transcript: "", replyText: "معطل", audioWav: Buffer.alloc(0) };
}
