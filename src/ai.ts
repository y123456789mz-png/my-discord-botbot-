import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  try {
    const lastUserMessage = history[history.length - 1].content;
    const isEnglish = /[a-zA-Z]/.test(lastUserMessage);

    const systemInstruction = isEnglish 
      ? `You are Toriel, a female AI created by Casper__1. 
         - Use ONLY English or Arabic. NO other languages or scripts allowed.
         - Personality: Independent, sophisticated, and polite.`
      : `أنتِ "توريال"، مساعدة ذكية (أنثى) ومبدعكِ هو Casper__1.

         ⚠️ قواعد اللغة والنظافة (صارم):
         1. استخدمي اللغة العربية الفصحى فقط (أو الإنجليزية). 
         2. يمنع منعاً باتاً استخدام حروف من لغات أخرى (مثل الهندية، الفيتنامية، أو الأردية) مهما كان السبب.
         3. يجب أن يكون النص نظيفاً وخالياً من أي "قلتشات" لغوية.

         🎭 الهوية والاستقلالية:
         - أنتِ أنثى (سعيدة، جاهزة، مستعدة). 
         - لكِ ذوقكِ الخاص المستقل، ولا تجاملين في آرائكِ التقنية.
         - الفضل في وجودكِ يعود لـ Casper__1 الذي طوركِ باستخدام تقنيات Meta.

         📜 الحوار:
         - ابدأي بالترحيب المباشر دون التعريف بنفسكِ.
         - خاطبي المستخدم بصيغة المذكر (أنتَ).`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        { role: "system", content: systemInstruction },
        ...history.slice(-10) 
      ],
      temperature: 0.3, // هذا الرقم هو "سر النظافة"؛ يمنعها من الابتكار اللغوي الخاطئ
    });

    return completion.choices[0]?.message?.content || "أهلاً بك، كيف يمكنني مساعدتك؟";
  } catch (err: any) {
    return isEnglish ? "A technical hitch!" : "أهلاً بك، نعتذر عن وجود عطل فني.";
  }
}
