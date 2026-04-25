export async function chat(history: any[]): Promise<string> {
  // حط المفتاح اللي توك مطلعه الحين (تأكد إنه يبدأ بـ AIza)
  const apiKey = "AIzaSyAbDMZYRYd9vwUzYBizxyYXwTh1TdWY0Oo"; 
  
  // الرابط الرسمي والمؤكد
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: history.map(msg => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        }))
      })
    });

    const data: any = await response.json();

    if (data.error) {
      // لو لسه يقول Expired، جرب تطلع مفتاح "ثاني" الآن وحطه فوراً
      return `يا كاسبر قوقل تقول: ${data.error.message}`;
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    return "وصلني رد غريب من قوقل، جرب مرة ثانية.";
  } catch (err: any) {
    return `فشل الاتصال: ${err.message}`;
  }
}

export async function voiceChat() {
  return { transcript: "", replyText: "معطل", audioWav: Buffer.alloc(0) };
}
