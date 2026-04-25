import { GoogleGenerativeAI } from "@google/generative-ai";

export async function chat(history: any[]): Promise<string> {
  // سحب مفتاح قوقل من الإعدادات
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  
  // نستخدم موديل Flash لأنه طيارة وسريع في الرد
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "أنت مساعد ذكي بلمحة من روح توريال. لهجتك سعودية سنعة ومزيج مع إنجليزي. آرثر مورغان هو أسطورة ريد ديد وليس لاعب كرة قدم! خاطب العيال دائماً بصيغة المذكر. خلك واقعي وابتعد عن الكرنج."
  });

  try {
    // تحويل التاريخ لصيغة قوقل (قوقل يحب يحس إنها محادثة حقيقية)
    const chatSession = model.startChat({
      history: history.slice(0, -1).map(h => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      })),
    });

    const lastMessage = history[history.length - 1].content;
    const result = await chatSession.sendMessage(lastMessage);
    
    return result.response.text();
  } catch (err: any) {
    return `يا كاسبر قوقل زعلان: ${err.message}`;
  }
}
