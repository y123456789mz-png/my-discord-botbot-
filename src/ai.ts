export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chat(history: ChatMessage[]): Promise<string> {
  // جلب البيانات من المتغيرات اللي حطيناها في رندر
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
  const model = process.env["AI_MODEL"] || "google/gemini-2.0-flash-lite-preview-02-05:free";

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://render.com", // ضروري لبعض موديلات OpenRouter
        "X-Title": "Casper Bot"
      },
      body: JSON.stringify({
        "model": model,
        "messages": [
          { role: "system", content: "You are a friendly, helpful AI assistant. Keep it conversational." },
          ...history
        ]
      })
    });

    const data: any = await response.json();
    
    // إذا فيه رد من الذكاء الاصطناعي رجعه، وإذا لا عطنا رسالة واضحة
    return data.choices?.[0]?.message?.content || "وصلني رد فاضي من السيرفر، شيك على رصيدك في OpenRouter.";

  } catch (error: any) {
    console.error("AI Error:", error);
    return `فشل الاتصال بالذكاء الاصطناعي: ${error.message}`;
  }
}

// هذي عشان البوت ما ينهار إذا كان يستخدم ملفات الصوت
export async function voiceChat(wavInput: any, speakerName: string): Promise<any> {
  return { transcript: "", replyText: "خاصية الصوت غير مفعلة حالياً.", audioWav: Buffer.alloc(0) };
}
