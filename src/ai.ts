import Groq from "groq-sdk";

export async function chat(history: any[]): Promise<string> {
  // 1. حط مفتاح Groq اللي جبته هنا
  const apiKey = "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"; 
  const groq = new Groq({ apiKey });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: history.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      model: "llama-3.3-70b-versatile",
    });

    return chatCompletion.choices[0]?.message?.content || "رد فاضي";

  } catch (err: any) {
    return `يا كاسبر حتى Groq زعلان: ${err.message}`;
  }
}

export async function voiceChat() {
  return { transcript: "", replyText: "معطل", audioWav: Buffer.alloc(0) };
}
