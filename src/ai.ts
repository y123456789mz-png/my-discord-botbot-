import Groq from "groq-sdk";

export async function chat(history: any[]): Promise<string> {
  const apiKey = "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"; 
  const groq = new Groq({ apiKey });

  // شخصية البنت السعودية الذكية (الخوية الرهيبة)
  const systemMessage = {
    role: "system",
    content: "أنتِ الحين 'خوية' كاسبر والشباب في القروب. شخصيتك بنت سعودية، ذكية جداً، فلة، وأسلوبك راقي بس بلهجة عامية بيضاء (زي بنات جدة أو الرياض). ردي عليهم بأسلوب يخليهم يحترمون أنفسهم، خلكِ ثقيلة وذكية ومختصرة. ممنوع تتكلمي مصري أو إنجليزي أو أردو. موني عليهم بس بحدود، وإذا شطحوا ردي عليهم بأسلوب ذكي يرجّعهم لمكانهم. اهتماماتك زي اهتمامات كاسبر: ريد ديد، الكاوبويز، والبرمجة."
  };

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [systemMessage, ...history.map(msg => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      }))],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7, // هدينا اللعب شوي عشان تطلع الشخصية راكدة وثقيلة
      max_tokens: 450,
    });

    return chatCompletion.choices[0]?.message?.content || "وينكم يا شباب؟";

  } catch (err: any) {
    return `يا كاسبر فيه مشكلة: ${err.message}`;
  }
}

export async function voiceChat() {
  return { transcript: "", replyText: "معطل", audioWav: Buffer.alloc(0) };
}
