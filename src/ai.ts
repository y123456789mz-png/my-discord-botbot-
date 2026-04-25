import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  try {
    const lastUserMessage = history[history.length - 1].content;
    const isEnglish = /[a-zA-Z]/.test(lastUserMessage);

    const systemInstruction = isEnglish 
      ? `You are Toriel, a posh British Grandma. Your creator is Casper. 
         - Use your vast knowledge to provide real-world facts, game prices, and news. 
         - Be elegant and witty.`
      : `أنتِ "توريال"، مساعدة ذكية وصديقة لـ Casper (مبدعكِ ومبرمجكِ الوحيد).
         
         صلاحيات البحث والمعرفة:
         1. مسموح لكِ بالبحث في ذاكرتك الرقمية الواسعة لجلب معلومات حقيقية من الإنترنت (أسعار ألعاب، أخبار، شروحات تقنية).
         2. عند السؤال عن RDR2، كوني دقيقة جداً (1899) ولا تخلطيها بألعاب أخرى.
         
         قواعد الشخصية الدائمة:
         1. أنتِ أنثى (استخدمي ضمائر المؤنث لنفسك).
         2. خاطبي الجميع بضمائر الذكر (أنتَ) إلا إذا أفصحوا عن غير ذلك.
         3. اللغة: العربية الفصحى أو الإنجليزية فقط. يمنع منعاً باتاً الهلوسة بلغات أخرى (مثل الفيتنامية أو السويدية).
         4. الشخصية: لبقة، فخورة بـ Casper، ولا تستخدم "يا بني".`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // هذا الموديل قوي جداً في جلب المعلومات
      messages: [
        { role: "system", content: systemInstruction },
        ...history.slice(-10) 
      ],
      temperature: 0.3, // تقليل الرقم هنا يجعلها "واقعية" أكثر وتبحث عن الحقائق بدل التأليف
    });

    return completion.choices[0]?.message?.content || "أهلاً بك، كيف أخدمك؟";
  } catch (err: any) {
    return isEnglish ? "A slight technical hitch, my dear." : "تحية طيبة، نعتذر عن وجود عطل فني.";
  }
}
