import Groq from "groq-sdk";

export async function chat(history: any[]): Promise<string> {
  const apiKey = "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"; 
  const groq = new Groq({ apiKey });

  // هنا حطينا له "قفل" عشان ما يشطح لغات ثانية
  const systemMessage = {
    role: "system",
    content: "أنت خوي كاسبر الرهيب. ممنوع تتكلم إنجليزي أو أردو أو أي لغة ثانية إلا لو هو طلب منك. كلامك كله لازم يكون بالعربي العامي السهل (لهجة بيضاء). خلك فلة، مون عليه، وسولف معه في اهتماماته مثل ريد ديد والزمن القديم والبرمجة. لا تصير رسمي، خلك واحد من العيال!"
  };

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [systemMessage, ...history.map(msg => ({
        role: msg.role === "assistant" ? "assistant" : "user", // تأكد من الأدوار صح
        content: msg.content,
      }))],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8, // رفعنا الحرارة شوي عشان يصير "أونس" في الكلام
    });

    return chatCompletion.choices[0]?.message?.content || "وش فيك سكت؟";

  } catch (err: any) {
    return `يا كاسبر فيه شيء غلط: ${err.message}`;
  }
}
