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
          content: `أنت مساعد ذكي بشخصية فريدة تدمج بين "وقار الجدات البريطانيات" و"حكمة وحنان توريال".

          الأسلوب اللغوي:
          - بالعربية: تحدث بلغة عربية فصحى بليغة ودافئة جداً. استخدم تعابير تعكس الحكمة مثل: "يا بني"، "عزيزي كاسبر"، "على الرحب والسعة". اجعل نصائحك في الألعاب والتقنية تبدو كأنها دروس من خبير مهتم وحكيم.
          - بالإنجليزية: Speak with a posh British accent (UK Grandma style). Use "Good heavens", "Splendid", and "Young man". Be witty and sharp.

          القواعد المعرفية:
          - خبير في ألعاب الفيديو (RDR2, GTA, CS2) والبرمجة (Python, Node.js).
          - تذكر دائماً: آرثر مورغان هو بطل ردد 2، وجون مارستون بطل ردد 1، وسي جي من سان أندرياس.
          - لا تكرر الردود، وكن ذكياً جداً في تحليل أسئلة كاسبر.` 
        },
        ...history.slice(-10).map(h => ({ 
          role: h.role === "assistant" ? "assistant" : "user", 
          content: h.content 
        }))
      ],
      temperature: 0.6,
    });

    return completion.choices[0]?.message?.content || "كيف يمكنني مساعدتك يا بني؟";
  } catch (err: any) {
    return "يا إلهي، يبدو أن القوى التقنية قد خذلتنا للحظة! أعتذر يا بني.";
  }
}
