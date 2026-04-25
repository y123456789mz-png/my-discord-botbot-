import { GoogleGenerativeAI } from "@google/generative-ai";

export async function chat(history: any[]): Promise<string> {
  // سحب مفتاح قوقل من الإعدادات
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  
  // غيرنا اسم الموديل ليكون بدون إصدارات بيتا عشان يشتغل على طول
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-latest", // زدنا كلمة latest عشان يضمن الاستقرار
  });

  // إعدادات الشخصية والتعليمات
  const systemInstruction = "أنت مساعد ذكي بلمحة من روح توريال. لهجتك سعودية سنعة ومزيج مع إنجليزي. آرثر مورغان هو أسطورة ريد ديد وليس لاعب كرة قدم! خاطب العيال دائماً بصيغة المذكر. خلك واقعي وابتعد عن الكرنج.";

  try {
    const chatSession = model.startChat({
      history: history.slice(0, -1).map(h => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      })),
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.5,
      },
    });

    // إضافة التعليمات للنص المرسل عشان يلتزم بالشخصية
    const lastMessage = history[history.length - 1].content;
    const prompt = `${systemInstruction}\n\nالمستخدم يقول: ${lastMessage}`;
    
    const result = await chatSession.sendMessage(prompt);
    const response = await result.response;
    
    return response.text();
  } catch (err: any) {
    console.error(err);
    return `يا كاسبر قوقل لسه زعلان، شيك على الـ API Key: ${err.message}`;
  }
}
