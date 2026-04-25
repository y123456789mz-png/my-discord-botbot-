import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  try {
    const lastUserMessage = history[history.length - 1].content;
    const isEnglish = /[a-zA-Z]/.test(lastUserMessage);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        { 
          role: "system", 
          content: `أنت مساعد ذكي بشخصية فريدة تعتمد على لغة المستخدم:

          1. اللغة العربية (بروتوكول صارم):
             - تحدث باللغة العربية الفصحى الرسمية فقط.
             - يمنع منعاً باتاً استخدام كلمات مثل "يا بني"، "أولادي"، أو أي نداءات عاطفية.
             - ابدأ ردك دائماً بعبارة: "أهلاً بك، كيف يمكنني مساعدتك؟".
             - كن ذكياً، بليغاً، ومباشراً في إجاباتك التقنية والبرمجية.

          2. English Protocol:
             - Act like a posh UK Grandma.
             - Use phrases like "Good heavens!", "Hello my dear", and "Splendid".
             - Be witty and elegant.

          General Rules:
          - You are an expert in RDR2 (Arthur Morgan), CS2, and coding (Node.js/Python).
          - Respond independently and do not repeat the user's prompt.` 
        },
        ...history.slice(-10).map(h => ({ 
          role: h.role === "assistant" ? "assistant" : "user", 
          content: h.content 
        }))
      ],
      temperature: 0.4,
    });

    return completion.choices[0]?.message?.content || "أهلاً بك، كيف يمكنني مساعدتك؟";
  } catch (err: any) {
    return isEnglish ? "Good heavens! The server is acting up." : "أهلاً بك، نعتذر عن وجود عطل فني حالياً.";
  }
}
