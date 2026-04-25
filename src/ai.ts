export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chat(history: ChatMessage[]): Promise<string> {
  // حط مفتاح Google AI Studio هنا
  const apiKey = "AIzaSyDNg1dbkerx1WIipn5CILC23L49SHUh8iM"; 
  
  // استخدمنا gemini-pro لأنه الأكثر استقراراً في الرابط v1
  const model = "gemini-pro"; 

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
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
      // لو لسه فيه خطأ، بنجرب نرجع لـ gemini-1.5-flash بس بدون v1beta
      return `خطأ من قوقل: ${data.error.message}`;
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "وصل رد فاضي من قوقل.";

  } catch (error: any) {
    return `فشل الاتصال: ${error.message}`;
  }
}

export async function voiceChat() {
  return { transcript: "", replyText: "معطل", audioWav: Buffer.alloc(0) };
}
