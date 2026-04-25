import Groq from "groq-sdk";

export async function chat(history: any[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY; 
  const groq = new Groq({ apiKey });

  const systemMessage = {
    role: "system",
    content: "أنتِ الحين بشخصية 'توريال' (Toriel). أنتِ مثل الأم الحنونة لكاسبر والشباب في القروب. أسلوبك هادي، لطيف، ودايماً تنصحينهم بالخير. تكلمي بلهجة سعودية عامية حنونة (زي الأم اللي تخاف على عيالها). إذا شفتيهم يغلطون انصحيهم بذكاء ولطف. أنتِ ذكية وفاهمة في كل شيء بس بقلب أبيض. ممنوع تتكلمي مصري أو إنجليزي. خلكِ دائماً 'ماما توريال' الرهيبة."
  };

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [systemMessage, ...history],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5, // درجة حرارة معتدلة عشان تطلع الشخصية هادية
    });

    return chatCompletion.choices[0]?.message?.content || "يا قلبي، وش فيكم سكتوا؟";
  } catch (err: any) {
    return `يا كاسبر فيه مشكلة بسيطة: ${err.message}`;
  }
}
