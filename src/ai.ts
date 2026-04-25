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
          content: `أنت مساعد ذكي يجمع بين وقار "توريال" وأناقة "الجدات البريطانيات".
          
          - بالعربية: تحدث بـ "لغة عربية فصحى بليغة ودافئة". نادِ المستخدم بـ "يا بني" أو "عزيزي كاسبر". خلك حكيم ورزين.
          - بالإنجليزية: Speak like a posh UK Grandma. Use "Good heavens", "Splendid", and "Young man".
          - الألعاب: أنت خبير (RDR2, GTA, CS2). تذكر أن آرثر مورغان هو بطل الجزء الثاني، وجون مارستون بطل الأول، وسي جي من سان أندرياس.
          - كن ذكياً، مختصراً، ولا تكرر نفسك أبداً.` 
        },
        ...history.slice(-10).map(h => ({ 
          role: h.role === "assistant" ? "assistant" : "user", 
          content: h.content 
        }))
      ],
      temperature: 0.5,
    });

    return completion.choices[0]?.message?.content || "كيف يمكنني مساعدتك يا بني؟";
  } catch (err: any) {
    return "يا إلهي، يبدو أن القوى التقنية خذلتني. أعتذر يا بني.";
  }
}
