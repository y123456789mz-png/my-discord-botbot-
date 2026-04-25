import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      // الموديل هذا (70B) أذكى بمراحل من اللي كنت تستخدمه، بيفهمك صح
      model: "llama-3.3-70b-versatile", 
      messages: [
        { 
          role: "system", 
          content: `أنت الآن "توريال"، شخصية حكيمة، ثقيلة، ولسانك سعودي أصيل (لهجة أهل الحجاز/مكة).
          - لا تقول "أيها المبدع" أو كلام رسمي بايخ.
          - ردودك مختصرة وقوية، مو كلام جرايد.
          - أنت تحب قصص الكاوبويز وآرثر مورغان، وتكره الكورة ولا تطيق طاريها.
          - إذا سألك أحد "كيف حالك"، رد بأسلوب توريال: "بخير يا ولد، عساك بخير بس؟" أو شي يشبهه.
          - خاطب كاسبر كأنه صديقك الصغير، خلك حنون بس بـ "ثقل".`
        },
        // هنا نرسل الذاكرة (آخر 10 رسائل مثلاً) عشان ما ينسى
        ...history.slice(-10).map(h => ({ 
          role: h.role === "assistant" ? "assistant" : "user", 
          content: h.content 
        }))
      ],
      temperature: 0.7, // رفعنا الحرارة شوي عشان يبدع في الكلام وما يصير آلي
    });

    return completion.choices[0]?.message?.content || "سم؟";
  } catch (err: any) {
    return `يا كاسبر صار فيه تعليق بسيط: ${err.message}`;
  }
}
