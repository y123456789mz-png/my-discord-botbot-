import OpenAI from "openai";

export async function chat(history: any[]): Promise<string> {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-flash-1.5-8b", // موديل قوقل بس عن طريق وسيط شغال 100%
      messages: [
        { role: "system", content: "أنت مساعد ذكي بلمحة من روح توريال. لهجتك سعودية سنعة ومزيج مع إنجليزي. آرثر مورغان هو أسطورة ريد ديد وليس لاعب كرة قدم! خاطب العيال دائماً بصيغة المذكر. خلك واقعي وابتعد عن الكرنج." },
        ...history.map(h => ({ role: h.role, content: h.content }))
      ],
    });

    return response.choices[0].message.content || "سم؟";
  } catch (err: any) {
    return `يا كاسبر فيه بلا في OpenRouter: ${err.message}`;
  }
}
