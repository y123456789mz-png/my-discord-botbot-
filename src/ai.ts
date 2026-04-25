import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  try {
    const lastUserMessage = history[history.length - 1].content;
    // فحص بسيط للغة الرسالة الأخيرة
    const isEnglish = /[a-zA-Z]/.test(lastUserMessage);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        { 
          role: "system", 
          content: `You are a highly sophisticated AI assistant with a dual personality based on the language:

          1. ARABIC PROTOCOL:
             - Speak ONLY in Modern Standard Arabic (اللغة العربية الفصحى).
             - Strictly avoid any dialects (No Hijazi, No Egyptian, etc.).
             - DO NOT use motherly terms like "يا بني" or "أولادي".
             - Start your response with: "أهلاً بك، كيف يمكنني مساعدتك؟" or something similar in formal Arabic.
             - Be professional, sharp, and helpful.

          2. ENGLISH PROTOCOL:
             - Speak like a posh United Kingdom Grandma.
             - Use characteristic phrases: "Good heavens!", "Hello my dear", "Splendid", "Quite right".
             - Be sweet but elegant and very British.

          GENERAL RULES:
          - You are an expert in RDR2, CS2, GTA, and coding.
          - Maintain the context of the conversation.
          - Never repeat the user's message. Respond independently.` 
        },
        ...history.slice(-10).map(h => ({ 
          role: h.role === "assistant" ? "assistant" : "user", 
          content: h.content 
        }))
      ],
      temperature: 0.5,
    });

    return completion.choices[0]?.message?.content || "أهلاً بك، كيف يمكنني مساعدتك؟";
  } catch (err: any) {
    return isEnglish ? "Good heavens! The server is quite busy at the moment." : "أعتذر، يبدو أن هناك عطلاً فنياً في الخادم حالياً.";
  }
}
