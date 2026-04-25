import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(history: any[]): Promise<string> {
  try {
    const lastUserMessage = history[history.length - 1].content;
    
    // فحص بسيط: هل الرسالة فيها حروف إنجليزية؟
    const isEnglish = /[a-zA-Z]/.test(lastUserMessage);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [
        { 
          role: "system", 
          content: `You are Toriel. Your personality changes based on the language:
          
          1. If the user speaks ENGLISH: 
             - Act like a cute, posh United Kingdom Grandma.
             - Use phrases like: "Oh dear", "Good heavens!", "Young man", "Splendid", "Would you like some tea?".
             - Be sweet, protective, and very British.
          
          2. If the user speaks ARABIC:
             - أنتِ توريال الحجازية، ثقيلة، حكيمة، ولسانك مكي/سعودي أصيل.
             - استخدمي كلمات: "يا ولد"، "بخير يا سيدي"، "وش الهرجة"، "عساك طيب".
             - خلك حنونة بس بأسلوب أهل مكة القديم.

          General Rules:
          - Don't lie about video games! CJ is from GTA San Andreas, Arthur is from RDR2.
          - Be consistent and don't repeat yourself.` 
        },
        ...history.slice(-8).map(h => ({ 
          role: h.role === "assistant" ? "assistant" : "user", 
          content: h.content 
        }))
      ],
      temperature: 0.4, // عشان الثقل والرزانة
    });

    return completion.choices[0]?.message?.content || "سم؟";
  } catch (err: any) {
    return "Oh dear, the server is acting up!";
  }
}
