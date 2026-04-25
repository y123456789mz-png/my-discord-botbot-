import Groq from "groq-sdk";

export async function chat(history: any[]): Promise<string> {
  const apiKey = "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"; 
  const groq = new Groq({ apiKey });

  // هنا حطينا له اللهجة السعودية والبيئة الصح
  const systemMessage = {
    role: "system",
    content: "أنت خوي كاسبر الرهيب في ديسكورد. ممنوع تتكلم مصري أو إنجليزي أو أردو. كلامك لازم يكون بالعامية السعودية (لهجة أهل مكة والجدة أو نجدية خفيفة). سولف كأنك واحد من الشباب في الاستراحة، خلك فلة ويمون، ولا تستخدم كلمات رسمية. إذا سألك عن ريد ديد أو الكاوبويز عطيه جوه يا بطل."
  };

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [systemMessage, ...history.map(msg => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      }))],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7, // هدينا اللعب شوي عشان ما يشطح لغات ثانية
    });

    return chatCompletion.choices[0]?.message?.content || "وش فيك سكت؟";

  } catch (err: any) {
    return `يا كاسبر فيه شيء غلط: ${err.message}`;
  }
}
