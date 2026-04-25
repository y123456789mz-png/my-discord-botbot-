export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chat(history: ChatMessage[]): Promise<string> {
  // تأكد إن المفتاح يبدأ بـ AIza
  const apiKey = "AIzaSyDNg1dbkerx1WIipn5CILC23L49SHUh8iM"; 
  
  // غيرنا الموديل إلى gemini-1.5-flash (بدون كلمة latest)
  // وغيرنا الرابط إلى v1beta لأنه هو اللي يدعم Flash حالياً
  const model = "gemini-1.5-flash"; 

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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

    if (data.candidates && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
    }

    return "وصل رد من قوقل بس بتنسيق غريب!";

  } catch (error: any) {
    return `فشل الاتصال: ${error.message}`;
  }
}

export async function voiceChat() {
  return { transcript: "", replyText: "معطل", audioWav: Buffer.alloc(0) };
}
