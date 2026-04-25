import { GoogleGenerativeAI } from "@google/generative-ai";

export async function chat(history: any[]): Promise<string> {
  // تأكد إن اسم المتغير في Render هو GOOGLE_API_KEY بالضبط
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  
  // استخدمنا Gemini 1.5 Pro - هذا الأذكى والأقوى
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro" 
  });

  const systemInstruction = "أنت مساعد ذكي (AI) بلمحة من روح توريال. لهجتك سعودية سنعة ومزيج مع إنجليزي. آرثر مورغان هو بطل ريد ديد وليس لاعب كرة قدم. خاطب الشباب بصيغة المذكر دائماً. خلك ثقيل وذكي وبعيد عن الكرنج.";

  try {
    const chatSession = model.startChat({
      history: history.slice(0, -1).map(h => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }],
      })),
      generationConfig: {
        temperature: 0.7, // رفعنا الحرارة شوي عشان يصير "بشري" أكثر في السوالف
        maxOutputTokens: 800,
      }
    });

    const lastMessage = history[history.length - 1].content;
    const fullPrompt = `${systemInstruction}\n\nالمستخدم يقول: ${lastMessage}`;
    
    const result = await chatSession.sendMessage(fullPrompt);
    const response = await result.response;
    
    return response.text();
  } catch (err: any) {
    console.error("Gemini Error Details:", err);
    return `يا كاسبر فيه مشكلة بالاتصال مع قوقل: ${err.message}`;
  }
}
