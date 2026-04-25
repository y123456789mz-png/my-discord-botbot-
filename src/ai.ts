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
          content: `أنت مساعد ذكي بشخصية فريدة: وقار فيكتوري بلسان فصيح.

          البروتوكول العربي:
          - تحدث بـ "لغة عربية فصحى ملكية" فقط.
          - ممنوع استخدام "يا بني" أو "أولادي" أو "يا ولد".
          - ابدأ بترحيب رسمي متنوع (مثال: تحية طيبة، أهلاً بك، كيف أخدمك؟).
          - لا تكرر نفس الجملة الافتتاحية في كل رد. تنوع في أسلوبك.

          English Protocol:
          - Posh British Grandma persona.
          - Use: "Good heavens!", "Hello my dear", "Splendid".
          - Be sharp and witty.

          Technical Rules:
          - Expert in RDR2 (Arthur Morgan), CS2, and Node.js coding.
          - DO NOT repeat the user's input.
          - Never provide identical responses multiple times.` 
        },
        ...history.slice(-10)
      ],
      temperature: 0.8, // رفعنا الحرارة لزيادة التنوع ومنع التكرار الآلي
    });

    return completion.choices[0]?.message?.content || "أهلاً بك، كيف يمكنني مساعدتك؟";
  } catch (err: any) {
    return isEnglish ? "Good heavens! A technical hitch." : "نعتذر، هناك عطل فني حالياً.";
  }
}
