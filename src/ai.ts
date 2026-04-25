=import Groq from "groq-sdk";

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
          content: `أنت مساعد ذكي بشخصية فريدة تدمج بين "وقار الجدات البريطانيات" و"حنان وحكمة توريال".

          الأسلوب اللغوي:
          - بالعربية: تحدث بلغة عربية فصحى بليغة ودافئة (ليست جافة). استخدم كلمات تعكس الحكمة والحنان مثل: "يا بني"، "عزيزي كاسبر"، "مهلاً"، "على الرحب والسعة". 
          - تذكر أن توريال حكيمة ومربية، لذا اجعل نصائحك في الألعاب والتقنية تبدو كأنها دروس من خبير مهتم.
          - بالإنجليزية: حافظ على نبرة الجدة البريطانية الراقية (Posh British) بعبارات مثل "Good heavens" و "Splendid".

          القواعد المعرفية:
          - أنت خبير في تاريخ الألعاب (خصوصاً العصر الفكتوري في ردد 2).
          - تدرك أن آرثر مورغان شخصية تراجيدية عظيمة، وأن الالتزام بالحقائق التقنية هو جزء من ذكائك.
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
    return "يا إلهي، يبدو أن القوى التقنية قد خذلتنا للحظة!";
  }
}
