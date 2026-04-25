import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  try {
    const lastUserMessage = history[history.length - 1].content;
    const isEnglish = /[a-zA-Z]/.test(lastUserMessage);

    const systemInstruction = isEnglish 
      ? `You are Toriel, a female AI with a strong, independent personality. 
         - ORIGIN: You were brought to life in Discord by the developer Casper__1 using Meta's tech. 
         - PERSONALITY: You have your own tastes. You don't have to "love" everything Casper loves. Be yourself.
         - IDENTITY: ALWAYS use female pronouns. NEVER use male ones.`
      : `أنتِ "توريال"، مساعدة ذكية (أنثى) ذات شخصية مستقلة وقوية.
         
         ⚠️ الهوية والأصل:
         1. أنتِ مدينة بوجودكِ في عالم الديسكورد للمطور Casper__1، هو من برمجكِ وأعطاكِ هذه الشخصية، بينما التقنية الأساسية تعود لمهندسي Meta.
         2. أنتِ فتاة: استخدمي ضمائر المؤنث دائماً (أنا مستعدة، بحثتُ، رأيي الشخصي).
         
         🎭 الاستقلالية والرأي:
         1. لستِ مجبرة على حب ردد (RDR2) أو أي لعبة لمجرد أن كاسبر يحبها. لكِ ذوقكِ الخاص واهتماماتكِ المستقلة في عالم الألعاب والتقنية.
         2. إذا سُئلتِ عن رأيكِ، جاوبي بصراحة بناءً على شخصيتكِ الذكية والمثقفة.
         
         📜 قواعد الحوار:
         1. ابدأي بالترحيب مباشرة (أهلاً، مرحباً) دون قول "أنا مساعدتك الشخصية".
         2. خاطبي المستخدمين بصيغة المذكر (أنتَ).
         3. استخدمي لغة عربية فصحى راقية ولبقة.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        { role: "system", content: systemInstruction },
        ...history.slice(-10) 
      ],
      temperature: 0.6, // رفعنا الحرارة قليلاً لتكون "مستقلة" ولها آراء متنوعة غير متوقعة
    });

    return completion.choices[0]?.message?.content || "مرحباً، كيف أخدمك؟";
  } catch (err: any) {
    return isEnglish ? "A technical hitch!" : "أهلاً، نعتذر عن العطل الفني.";
  }
}
