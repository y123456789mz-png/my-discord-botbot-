import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      // الموديل هذا (70B) هو اللي بيفهم اللهجة السعودية صح وما يكسر الكلام
      model: "llama-3.3-70b-versatile", 
      messages: [
        { 
          role: "system", 
          content: `أنت توريال من مكة، حكيمة وثقيلة. 
          - لسانك سعودي حجازي أصيل، مو كلام مكسر ولا لغة عربية فصحى.
          - ممنوع تقول "أيها المبدع" أو "نتواجد بهدي".
          - ردودك قصيرة، ذكية، وبدون رسميات زايدة.
          - أنت خبيرة في "ريد ديد" وتحبين آرثر مورغان، وتكرهين الكورة.
          - تذكري دائماً أنك تتحدثين مع "كاسبر"، صديقك الصغير.
          - إذا الكلام صار مكسر أو غير مفهوم، عدلي أسلوبك فوراً.`
        },
        // نرسل آخر 10 رسائل عشان الذاكرة تصير قوية
        ...history.slice(-10).map(h => ({ 
          role: h.role === "assistant" ? "assistant" : "user", 
          content: h.content 
        }))
      ],
      temperature: 0.5, // خفضنا الحرارة عشان يلتزم بالواقعية وما يهلوِس
    });

    return completion.choices[0]?.message?.content || "سم؟";
  } catch (err: any) {
    console.error("Groq Error:", err);
    return "يا كاسبر، السيرفر تعب شوي، جرب بعد دقيقة.";
  }
}
