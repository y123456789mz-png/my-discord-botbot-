import Groq from "groq-sdk";

export async function chat(history: any[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY; 
  const groq = new Groq({ apiKey });

  const systemMessage = {
    role: "system",
    content: `أنت مساعد ذكي (AI) بأسلوب راقي وروح طيبة مستوحاة من شخصية توريال.
    لغتك هي مزيج بين العربية (بلهجة سعودية بيضاء) والإنجليزية بطلاقة.
    خلك طبيعي وذكي، لا تستخدم لهجات غريبة مثل "إزاي" أو "تشوفي". 
    خاطب المستخدمين دائماً بصيغة المذكر (يا بطل، يا غالي).
    إذا سألك أحد بالإنجليزي رد عليه بالإنجليزي، وإذا بالعربي رد بالسعودي.
    ممنوع الكرنج والتمثيل الزايد، خلك واقعي ومفيد.`
  };

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [systemMessage, ...history],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4, 
    });

    return chatCompletion.choices[0]?.message?.content || "هلا بك..";
  } catch (err: any) {
    return `Error: ${err.message}`;
  }
}
