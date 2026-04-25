export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chat(history: ChatMessage[]): Promise<string> {
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
  // استخدمنا موديل ميسترال لأنه أضمن واحد للحسابات المجانية
  const model = process.env["AI_MODEL"] || "mistralai/mistral-7b-instruct:free";

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // أحياناً OpenRouter يطلب هذا كـ placeholder
        "X-Title": "Casper Discord Bot"
      },
      body: JSON.stringify({
        "model": model,
        "messages": [
          { role: "system", content: "You are a helpful AI assistant." },
          ...history
        ]
      })
    });

    const data: any = await response.json();
    
    // إذا طلع لك Error في الرد، بنطبعه عشان نشوفه
    if (data.error) {
      console.error("OpenRouter Error:", data.error);
      return `خطأ من السيرفر: ${data.error.message || "مشكلة في الحساب"}`;
    }

    return data.choices?.[0]?.message?.content || "السيرفر رد بس الرسالة كانت فاضية، جرب تغير الموديل.";

  } catch (error: any) {
    return `فشل الاتصال: ${error.message}`;
  }
}

export async function voiceChat(wavInput: any, speakerName: string): Promise<any> {
  return { transcript: "", replyText: "الصوت معطل.", audioWav: Buffer.alloc(0) };
}
