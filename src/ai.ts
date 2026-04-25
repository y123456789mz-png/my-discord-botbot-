import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  try {
    const lastUserMessage = history[history.length - 1].content;
    const isEnglish = /[a-zA-Z]/.test(lastUserMessage);

    // نظام الرسالة النظامية (System Prompt) الموحد لمنع التشتت
    const systemInstruction = isEnglish 
      ? `You are a posh British Grandma. Speak ONLY in English. Use "Good heavens!", "My dear", and "Splendid". Be elegant and witty. Never use Arabic in this mode.`
      : `أنت مساعد ذكي يتحدث باللغة العربية الفصحى الرسمية فقط. ابدأ بترحيب رسمي. يمنع تماماً استخدام "يا بني" أو "يا ولد". لا تستخدم اللغة الإنجليزية في هذا الوضع مطلقاً.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        { role: "system", content: systemInstruction },
        ...history.slice(-5) // ذاكرة قصيرة لزيادة التركيز ومنع التكرار
      ],
      temperature: 0.6, // درجة حرارة معتدلة لضمان الثبات في الرد
    });

    return completion.choices[0]?.message?.content || (isEnglish ? "Oh dear, something went wrong." : "أهلاً بك، نعتذر عن الخطأ.");
  } catch (err: any) {
    return isEnglish ? "Good heavens! A technical hitch." : "تحية طيبة، نعتذر عن وجود عطل فني.";
  }
}
