export async function chat(history: any[]): Promise<string> {
  // 1. حط مفتاحك الجديد هنا (تأكد إنه داخل علامات التنصيص وبدون مسافات)
  const apiKey = "AIzaSyAi-Pw8vRyNJ-_h1t2Frj4t8i9JmBhnr5E"; 
  
  // استخدمنا v1beta حصراً لأنه هو اللي يشغل gemini-1.5-flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: history.map(msg => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        }))
      })
    });

    const data: any = await response.json();

    // إذا طلع خطأ، بنعرف سببه بالضبط من قوقل
    if (data.error) {
      return `يا كاسبر قوقل ردت بـ: ${data.error.message}`;
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    return "وصل رد غريب من قوقل، جرب ترسل رسالة ثانية.";
  } catch (err: any) {
    return `فشل في الاتصال بالسيرفر: ${err.message}`;
  }
}

export async function voiceChat() {
  return { transcript: "", replyText: "معطل", audioWav: Buffer.alloc(0) };
}
