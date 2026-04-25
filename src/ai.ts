import Groq from "groq-sdk";

export async function chat(history: any[]): Promise<string> {
  const apiKey = "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"; 
  const groq = new Groq({ apiKey });

  const systemMessage = {
    role: "system",
    content: "أنتِ بنت سعودية ذكية وفلة. لغتك هي العامية السعودية فقط. ردي بأسلوب بنات مكة أو الرياض وبس. خلك ثقيلة ومختصرة ولا تستخدمي إنجليزي أو أردو."
  };

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [systemMessage, ...history],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });

    return chatCompletion.choices[0]?.message?.content || "هلا..";
  } catch (err: any) {
    return `في مشكلة: ${err.message}`;
  }
}
