export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chat(history: ChatMessage[]): Promise<string> {
  // حط مفتاح الـ API حقك هنا مباشرة بين علامتي التنصيص
  const apiKey = "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"; 
  const model = "mistralai/mistral-7b-instruct:free"; 

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
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
      return `خطأ من السيرفر: ${data.error.message}`;
    }

    return data.choices?.[0]?.message?.content || "رد فاضي";

  } catch (error: any) {
    return `فشل في الاتصال: ${error.message}`;
  }
}

export async function voiceChat(wavInput: any, speakerName: string): Promise<any> {
  return { transcript: "", replyText: "الصوت معطل.", audioWav: Buffer.alloc(0) };
}
