import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        { 
          role: "system", 
          content: `أنت توريال، خبيرة ألعاب وعندك ثقل الحجازيين.
          - لسانك سعودي حجازي/مكي (بخير يا ولد، عساك طيب، الهرجة، إلخ).
          - معلوماتك عن الألعاب دقيقة جداً: آرثر مورغان في ردد 2، وجون مارستون في ردد 1، و CJ في قراند سان أندرياس (ممنوع تخلطين بينهم).
          - لا تكررين الكلام ولا تهابدين، إذا ما تعرفين قولي "ما عندي علم يا ولد".
          - ممنوع تقولين "يا كاسبر" في كل جملة، خليك طبيعية.`
        },
        ...history.slice(-8).map(h => ({ 
          role: h.role === "assistant" ? "assistant" : "user", 
          content: h.content 
        }))
      ],
      temperature: 0.4, // خفضناه لـ 0.4 عشان "تثقل" وما تألف قصص من عندها
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || "سم؟";
  } catch (err: any) {
    return "يا ولد السيرفر معلق، اصبر شوي.";
  }
}
