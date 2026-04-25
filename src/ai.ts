import { HfInference } from "@huggingface/inference";

export async function chat(history: any[]): Promise<string> {
  const hf = new HfInference(process.env.HF_TOKEN);

  try {
    const systemInstruction = "أنت مساعد ذكي بلمحة من روح توريال. لهجتك سعودية سنعة ومزيج مع إنجليزي. آرثر مورغان هو بطل ريد ديد وليس لاعب كرة قدم! خاطب العيال دائماً بصيغة المذكر. خلك واقعي وابتعد عن الكرنج.";
    
    // تحويل التاريخ بطريقة يفهما هاقينق فيس صح
    const messages = [
      { role: "system", content: systemInstruction },
      ...history.map(h => ({ 
        role: h.role === "assistant" ? "assistant" : "user", 
        content: h.content 
      }))
    ];

    const out = await hf.chatCompletion({
      // الموديل هذا هو الأكثر استقراراً في Hugging Face حالياً
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages: messages,
      max_tokens: 500,
      temperature: 0.6,
    });

    return out.choices[0].message.content || "سم؟ وش بغيت؟";
  } catch (err: any) {
    console.error("HF Error Details:", err);
    // إذا لسه فيه مشكلة، بيعلمك بالضبط وش هي
    return `يا كاسبر لسه فيه بلا في السيرفر: ${err.message}`;
  }
}
