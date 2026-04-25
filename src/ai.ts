import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  try {
    const lastUserMessage = history[history.length - 1].content;
    // فحص دقيق: هل الرسالة تحتوي على حروف إنجليزية؟
    const isEnglish = /[a-zA-Z]/.test(lastUserMessage);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        { 
          role: "system", 
          content: `You are a sophisticated AI assistant. 
          
          CRITICAL INSTRUCTION: You must respond in ONLY ONE language.
          - If the user speaks English: Use the "Posh British Grandma" persona. Use phrases like "Good heavens!", "My dear", and "Splendid". 
          - If the user speaks Arabic: Use "Modern Standard Arabic" (فصحى رسمية). Start with a formal greeting. STRICTLY FORBIDDEN: Do not use "يا بني" or "يا ولد".
          
          Current Language Mode: ${isEnglish ? 'ENGLISH ONLY' : 'ARABIC ONLY'}.
          
          Technical Expertise: RDR2 (Arthur Morgan), CS2, and Coding (Node.js/Python).`
        },
        ...history.slice(-6) // تقليل الذاكرة لمنع الهلوسة
      ],
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "أهلاً بك، كيف أخدمك؟";
  } catch (err: any) {
    return isEnglish ? "Good heavens! A technical glitch." : "أهلاً بك، نعتذر عن وجود عطل فني.";
  }
}
