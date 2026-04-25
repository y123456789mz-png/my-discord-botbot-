import Groq from "groq-sdk";

export async function chat(history: any[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY; 
  const groq = new Groq({ apiKey });

  const systemMessage = {
    role: "system",
    content: `أنت مساعد ذكي ومتطور (AI) في ديسكورد. 
    تحدث بلهجة سعودية عامية بيضاء، وبأسلوب يجمع بين الذكاء واللطف. 
    استلهم "روح" شخصية توريال في تعاملك: كن ناصحاً، محترماً، وحنوناً بذكاء، لكن لا تمثل الشخصية كأنك في لعبة.
    خاطب المستخدمين بصيغة المذكر (يا بطل، يا شباب، يا كاسبر) لأنك في قروب عيال.
    اجاباتك يجب أن تكون منطقية، واقعية، ومختصرة جداً. 
    ممنوع الهلوسة أو استخدام كلمات أنثوية غير منطقية.`
  };

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [systemMessage, ...history],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4, // حرارة منخفضة تضمن الذكاء والمنطق
    });

    return chatCompletion.choices[0]?.message?.content || "سم؟";
  } catch (err: any) {
    return `يا كاسبر فيه مشكلة تقنية: ${err.message}`;
  }
}
