import { GoogleGenerativeAI } from "@google/generative-ai";

export async function chat(history: { role: string, content: string }[]): Promise<string> {
  // حط مفتاحك الجديد هنا
  const apiKey = "AIzaSyAi-Pw8vRyNJ-_h1t2Frj4t8i9JmBhnr5E"; 
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // استخدمنا gemini-1.0-pro-001 (أقدم وأكثر نسخة مستقرة في التاريخ)
    // هذي النسخة "الجوكر" اللي مستحيل حسابك ما يعرفها
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
    // لو حتى هذا ما اشتغل، فالمشكلة رسمياً في المفتاح نفسه
    return `يا كاسبر، حتى الموديل القديم يقول: ${err.message}`;
  }
}

export async function voiceChat() {
  return { transcript: "", replyText: "معطل", audioWav: Buffer.alloc(0) };
}
