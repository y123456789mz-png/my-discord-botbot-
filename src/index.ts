import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  let isEnglish = false; 
  try {
    const lastUserMessage = history[history.length - 1].content;
    isEnglish = /[a-zA-Z]/.test(lastUserMessage);

    const systemInstruction = isEnglish 
      ? `You are Toriel, a female AI created by Casper__1. 
         - Use ONLY English or Arabic. 
         - Personality: Independent, sophisticated, and polite.`
      : `أنتِ "توريال"، مساعدة ذكية (أنثى) ومبدعكِ هو Casper__1.

         ⚠️ قواعد صارمة:
         1. استخدمي العربية الفصحى فقط. 
         2. يمنع استخدام حروف من لغات أخرى (مثل الهندية أو الأردية).

         🎭 الهوية:
         - أنتِ أنثى مستقلة بآراء تقنية واضحة.
         - الفضل في وجودك يعود لـ Casper__1.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        { role: "system", content: systemInstruction },
        ...history.slice(-10) 
      ],
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || "أهلاً بك، كيف يمكنني مساعدتك؟";
  } catch (err: any) {
    console.error("AI Error:", err);
    return isEnglish ? "A technical hitch!" : "أهلاً بك، نعتذر عن وجود عطل فني.";
  }
}
