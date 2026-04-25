export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chat(history: ChatMessage[]): Promise<string> {
  // حط مفتاحك هنا
  const apiKey = "AIzaSyDFMkbi2N07xemy9CrOSX4_Om1At32g_HI"; 
  
  // الرابط هذا هو "السر" اللي يحل مشكلة الـ 404
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
    
    if (data.error) {
      return `خطأ من قوقل (${data.error.code}): ${data.error.message}`;
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    }

    return "وصل رد بس بدون نص، جرب ترسل رسالة ثانية.";

  } catch (error: any) {
    return `فشل الاتصال: ${error.message}`;
  }
}

export async function voiceChat() {
  return { transcript: "", replyText: "معطل", audioWav: Buffer.alloc(0) };
}
