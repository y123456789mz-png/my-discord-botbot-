import Groq from "groq-sdk";

export async function chat(history: any[]): Promise<string> {
  const apiKey = "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"; 
  const groq = new Groq({ apiKey });

  const systemMessage = {
    role: "system",
    content: "أنت مساعد ذكي ومحايد في ديسكورد، لست ذكراً ولا أنثى. تحدث بلهجة سعودية عامية بيضاء ومختصرة جداً. ممنوع استخدام أي لغة غير العربية. لا تتفلسف، جاوب على قد السؤال وبس."
  };

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [systemMessage, ...history.map(msg => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      }))],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4, // نزلناها أكثر عشان يركد وما يهلوس
    });

    return chatCompletion.choices[0]?.message?.content || "سم؟";

  } catch (err: any) {
    return `في مشكلة: ${err.message}`;
  }
}
