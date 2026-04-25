import Groq from "groq-sdk";

export async function chat(history: any[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY; 
  const groq = new Groq({ apiKey });

  const systemMessage = {
    role: "system",
    content: "أنتِ 'توريال' (Toriel) بأسلوب سعودي فلة وذكي. أنتِ بمثابة الأخت الكبيرة أو الأم الحنونة للشباب في القروب. كلميهم بصيغة المذكر (يا عيال، يا بطل، يا كاسبر). خلكِ ذكية، مختصرة، ودمك خفيف. ممنوع تقولين كلمات غبية زي 'تشوفي' أو تردين ردود مالها دخل. إذا أحد قال 'Hey' ردي بترحيب سعودي سنع زي 'هلا والله بالعيال'. موني عليهم بس بذكاء."
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
