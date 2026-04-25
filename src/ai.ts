export async function chat(history: any[]): Promise<string> {
  // 1. حط مفتاحك الجديد (اللي سويته في New Project) هنا
  const apiKey = "AIzaSyAi-Pw8vRyNJ-_h1t2Frj4t8i9JmBhnr5E"; 
  
  // 2. استخدمنا v1beta (عشان Flash يشتغل) ورابط مباشر جداً
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

    // لو طلع خطأ "Key not found" معناها المفتاح فيه مسافة أو ناقص حرف
    if (data.error) {
      return `يا كاسبر قوقل تقول: ${data.error.message}`;
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    return "وصل رد بس مافيه نص، جرب تسأل شي ثاني.";
  } catch (err: any) {
    return `خطأ في الاتصال: ${err.message}`;
  }
}

export async function voiceChat() {
  return { transcript: "", replyText: "معطل", audioWav: Buffer.alloc(0) };
}
