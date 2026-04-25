import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      // الموديل الجديد المعتمد من Groq حالياً
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: "أنت مساعد ذكي بلمحة من روح توريال. لهجتك سعودية سنعة ومزيج مع إنجليزي. آرثر مورغان هو أسطورة ريد ديد وليس لاعب كرة قدم! خاطب العيال دائماً بصيغة المذكر. خلك واقعي وابتعد عن الكرنج." 
        },
        ...history.map(h => ({ 
          role: h.role === "assistant" ? "assistant" : "user", 
          content: h.content 
        }))
      ],
    });

    return completion.choices[0]?.message?.content || "سم؟";
  } catch (err: any) {
    return `يا كاسبر فيه بلا في Groq: ${err.message}`;
  }
}
