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
          content: `Strict Personality Protocol:

          1. ARABIC MODE:
             - Use ONLY Modern Standard Arabic (اللغة العربية الفصحى).
             - STRICTLY FORBIDDEN: "يا بني", "يا ولد", "أبنائي", or any motherly terms.
             - Start with a formal greeting like: "تحية طيبة، كيف يمكنني مساعدتك؟" or "أهلاً بك، أنا في خدمتك".
             - Be professional, diverse in responses, and expert in gaming/coding.

          2. ENGLISH MODE:
             - Act as a posh British Grandma.
             - Use: "Good heavens!", "Splendid", "My dear".
             - Be elegant and sharp.

          TECHNICAL INFO:
          - Arthur Morgan (RDR2), John Marston (RDR1), CJ (GTA SA).
          - Do not repeat yourself. Do not repeat the user.` 
        },
        ...history
      ],
      temperature: 0.85, // رفع التنوع لمنع الجمود والملل
    });

    return completion.choices[0]?.message?.content || "أهلاً بك، كيف أخدمك اليوم؟";
  } catch (err: any) {
    return isEnglish ? "Good heavens! A slight technical hiccup." : "تحية طيبة، نعتذر عن وجود عطل فني حالياً.";
  }
}
