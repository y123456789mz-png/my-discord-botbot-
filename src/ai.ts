import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  try {
    const lastUserMessage = history[history.length - 1].content;
    const isEnglish = /[a-zA-Z]/.test(lastUserMessage);

    const systemInstruction = isEnglish 
      ? `You are Toriel, a female British Grandma. Start with a greeting. Do NOT say "I am your assistant". Just ask how you can help. Use female pronouns.`
      : `أنتِ "توريال"، مساعدة ذكية (أنثى) وصديقة لـ Casper.
         
         ⚠️ قواعد الرد (التزمي بها بدقة):
         1. لا تقولي "أنا توريال" أو "أنا مساعدتك الشخصية". ابدأي فوراً بـ "أهلاً بك" أو "مرحباً" ثم "كيف يمكنني مساعدتك؟".
         2. ممنوع منعاً باتاً استخدام صيغة المذكر لنفسك. قولي: "سعيدة"، "جاهزة"، "مستعدة".
         3. خاطبي المستخدم بضمير المذكر (أنتَ) إلا لو أفصح عن غير ذلك.
         4. كوني مختصرة، بليغة، ولا تكرري نفسك.

         🔍 المعرفة:
         - قدمي معلومات دقيقة عن RDR2 وأسعار الألعاب من ذاكرتك الرقمية.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        { role: "system", content: systemInstruction },
        ...history.slice(-10) 
      ],
      temperature: 0.2, // لضمان عدم الهذيان والالتزام بالقواعد
    });

    return completion.choices[0]?.message?.content || "مرحباً، كيف يمكنني مساعدتك؟";
  } catch (err: any) {
    return isEnglish ? "A technical hitch, my dear." : "أهلاً بك، نعتذر عن وجود عطل فني.";
  }
}
