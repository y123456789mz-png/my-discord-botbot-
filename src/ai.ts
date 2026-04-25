import { GoogleGenerativeAI } from "@google/generative-ai";

export async function chat(history: any[]): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  
  // استخدمنا gemini-1.5-flash كاسم موديل وحيد ومباشر
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const chatSession = model.startChat({
      history: history.slice(0, -1).map(h => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      })),
    });

    const systemInstruction = "أنت مساعد ذكي بلمحة من روح توريال. لهجتك سعودية سنعة ومزيج مع إنجليزي. آرثر مورغان هو بطل ريد ديد وليس لاعب كرة قدم! خاطب العيال دائماً بصيغة المذكر. خلك واقعي وابتعد عن الكرنج.";
    
    const lastMessage = history[history.length - 1].content;
    const result = await chatSession.sendMessage(`${systemInstruction}\n\nالمستخدم: ${lastMessage}`);
    
    return result.response.text();
  } catch (err: any) {
    console.error("خطأ قوقل:", err);
    return `يا كاسبر فيه مشكلة: ${err.message}`;
  }
}
