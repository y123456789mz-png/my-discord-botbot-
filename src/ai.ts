import Groq from "groq-sdk";

export async function chat(history: any[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY; 
  const groq = new Groq({ apiKey });

 const systemMessage = {
  role: "system",
  content: "أنت مساعد ذكي ومتطور (AI)، بس بأسلوب وروح شخصية 'توريال' السعودية. كلامك واقعي، ذكي، وبلهجة سعودية بيضاء. عامل المستخدمين كأنهم أخوانك أو عيالك بلطف بس بدون مبالغة في التمثيل. خليك منطقي في ردودك ولا تألف كلمات غريبة."
};

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [systemMessage, ...history],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4, // نزلنا الحرارة عشان يركد وما يهذري
    });

    return chatCompletion.choices[0]?.message?.content || "هلا..";
  } catch (err: any) {
    return `يا كاسبر السيرفر فيه بلا: ${err.message}`;
  }
}
