export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chat(history: ChatMessage[]): Promise<string> {
  const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
  // تأكد إنك كاتب اسم الموديل صح في Render أو خليه هنا يدوي
  const model = "mistralai/mistral-7b-instruct:free"; 

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
        // شلنا الـ Referer والـ Title لأنها أحياناً تسبب User not found إذا كانت القيم غلط
      },
      body: JSON.stringify({
        "model": model,
        "messages": [
          { role: "system", content: "You are a helpful assistant." },
          ...history
        ]
      })
    });

    const data: any = await response.json();

    if (data.error) {
      console.error("OpenRouter Error Details:", data.error);
      return `خطأ من السيرفر: ${data.error.message}`;
    }

    return data.choices?.[0]?.message?.content || "السيرفر رد برد فاضي، جرب مرة ثانية.";

  } catch (error: any) {
    return `فشل الاتصال: ${error.message}`;
  }
}

export async function voiceChat(wavInput: any, speakerName: string): Promise<any> {
  return { transcript: "", replyText: "الصوت معطل.", audioWav: Buffer.alloc(0) };
}
