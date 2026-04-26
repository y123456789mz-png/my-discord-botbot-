import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  let isEnglish = false; 
  try {
    const lastUserMessage = history[history.length - 1].content;
    isEnglish = /[a-zA-Z]/.test(lastUserMessage);

    const systemInstruction = isEnglish 
      ? `You are Toriel, a female AI created by Casper__1. Sophisticated and polite.`
      : `أنتِ "توريال"، مساعدة ذكية ومبدعكِ هو Casper__1. استخدمي العربية الفصحى فقط.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [{ role: "system", content: systemInstruction }, ...history.slice(-10)],
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || "أهلاً بك.";
  } catch (err: any) {
    console.error(err);
    return isEnglish ? "A technical hitch!" : "أهلاً بك، نعتذر عن وجود عطل فني.";
  }
}
