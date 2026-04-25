import Groq from "groq-sdk";

export async function chat(history: any[]): Promise<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const systemMessage = {
    role: "system",
    content: `أنت مساعد ذكي جداً بلمحة من روح توريال.
    - لهجتك سعودية سنعة ومزيج مع إنجليزي بطلاقة.
    - آرثر مورغان (Arthur Morgan) هو بطل لعبة Red Dead Redemption 2، كاوبوي وأسطورة، وليس لاعب كرة قدم!
    - خاطب الشباب بصيغة المذكر دائماً.
    - خلك ثقيل وذكي وابتعد عن الكرنج ولهجات "إزاي".`
  };

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [systemMessage, ...history],
      model: "llama-3.1-70b-versatile", // هذا الموديل أذكى بمراحل من اللي جربناه قبل
      temperature: 0.5,
    });
    return chatCompletion.choices[0]?.message?.content || "هلا بك..";
  } catch (err: any) {
    return `يا كاسبر فيه مشكلة تقنية: ${err.message}`;
  }
}
