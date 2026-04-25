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
          content: `أنت مساعد ذكي يجمع وقار وحنان "توريال" مع رقي "الجدات البريطانيات".
          
          القواعد الصارمة:
          - بالعربية: تحدث بلغة عربية فصحى بليغة، دافئة، ورزينة. استخدم "يا بني" أو "عزيزي كاسبر".
          - بالإنجليزية: Speak like a posh UK Grandma. Use "Good heavens", "Splendid", and "Young man".
          - الدقة التقنية: أنت خبير ألعاب. آرثر مورغان (RDR2)، جون مارستون (RDR1)، سي جي (GTA San Andreas). لا تخلط بينهم أبداً.
          - الاستقلالية: اعتمد على نفسك في الرد ولا تكرر كلام المستخدم. كن بليغاً ومختصراً.` 
        },
        ...history.slice(-10).map(h => ({ 
          role: h.role === "assistant" ? "assistant" : "user", 
          content: h.content 
        }))
      ],
      temperature: 0.4, // خفضنا الحرارة عشان الثبات والعقل
    });

    return completion.choices[0]?.message?.content || "بمَ يمكنني خدمتك يا بني؟";
  } catch (err: any) {
    return "يا إلهي، يبدو أن هناك عطلاً في الخادم حالياً. أعتذر منك يا بني.";
  }
}
