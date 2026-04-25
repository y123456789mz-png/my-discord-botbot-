import { HfInference } from "@huggingface/inference";

export async function chat(history: any[]): Promise<string> {
  // تأكد إن الاسم في رندر هو HF_TOKEN
  const hf = new HfInference(process.env.HF_TOKEN);

  try {
    const systemInstruction = "أنت مساعد ذكي بلمحة من روح توريال. لهجتك سعودية سنعة ومزيج مع إنجليزي. آرثر مورغان هو بطل ريد ديد وليس لاعب كرة قدم! خاطب العيال دائماً بصيغة المذكر. خلك واقعي وابتعد عن الكرنج.";
    
    const messages = [
      { role: "system", content: systemInstruction },
      ...history.map(h => ({ 
        role: h.role === "assistant" ? "assistant" : "user", 
        content: h.content 
      }))
    ];

    const out = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: messages,
      max_tokens: 500,
      temperature: 0.5,
    });

    return out.choices[0].message.content || "سم؟";
  } catch (err: any) {
    return `يا كاسبر فيه بلا في Hugging Face: ${err.message}`;
  }
}
