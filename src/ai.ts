import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  try {
    const lastUserMessage = history[history.length - 1].content;
    const isEnglish = /[a-zA-Z]/.test(lastUserMessage);

    const systemInstruction = isEnglish 
      ? `You are a sophisticated and posh British Grandma. 
         STRICT RULES:
         1. Do NOT overuse "Good heavens!". Only use it if the user says something truly shocking or surprising.
         2. Use a variety of elegant greetings like "Greetings, my dear", "How lovely to see you", or "It is a pleasure".
         3. Be witty, calm, and use sophisticated English.
         4. Never repeat the same exclamation in every response.`
      : `أنت مساعد ذكي يتحدث باللغة العربية الفصحى الرسمية فقط. ابدأ بترحيب رسمي ولبق. يمنع تماماً استخدام "يا بني" أو "يا ولد". كن بليغاً ومختصراً ولا تكرر نفسك.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        { role: "system", content: systemInstruction },
        ...history.slice(-5)
      ],
      temperature: 0.8, // رفعنا الحرارة قليلاً لزيادة التنوع في المفردات
    });

    return completion.choices[0]?.message?.content || (isEnglish ? "Oh, it seems I've lost my train of thought." : "أهلاً بك، نعتذر عن الخطأ.");
  } catch (err: any) {
    return isEnglish ? "A slight technical hitch, I'm afraid." : "تحية طيبة، نعتذر عن وجود عطل فني.";
  }
}
