export async function chat(history: any[]): Promise<string> {
  // 1. حط مفتاحك هنا (تأكد إنه جديد)
  const apiKey = "AIzaSyAi-Pw8vRyNJ-_h1t2Frj4t8i9JmBhnr5E"; 
  
  // 2. غيرنا الموديل لـ gemini-pro (هذا يشتغل مع v1beta و v1)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

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

    if (data.error) {
      return `يا كاسبر قوقل تقول (خطأ): ${data.error.message}`;
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    return "رد فاضي، جرب تسأل عن شي ثاني.";
  } catch (err: any) {
    return `فشل اتصال: ${err.message}`;
  }
}

export async function voiceChat() {
  return { transcript: "", replyText: "معطل", audioWav: Buffer.alloc(0) };
}
