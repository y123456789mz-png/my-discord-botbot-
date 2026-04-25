import { GoogleGenerativeAI } from "@google/generative-ai";

export async function chat(history: any[]): Promise<string> {
  // 1. المفتاح الجديد اللي توك مطلعه حطه هنا
  const apiKey = "AIzaSyCkruBFCAA2Uu19gEpZMDwScO9MNjy1-i0"; 
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // استخدمنا gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chatSession = model.startChat({
      history: history.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chatSession.sendMessage(history[history.length - 1].content);
    const response = await result.response;
    return response.text();

  } catch (err: any) {
    // إذا لسه فيه مشكلة، بيطلع لنا الكود الحقيقي للخطأ هنا
    return `يا كاسبر فيه مشكلة: ${err.message}`;
  }
}

export async function voiceChat() {
  return { transcript: "", replyText: "معطل", audioWav: Buffer.alloc(0) };
}
