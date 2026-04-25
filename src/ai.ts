export async function chat(history: any[]): Promise<string> {
  const apiKey = "AIzaSyAi-Pw8vRyNJ-_h1t2Frj4t8i9JmBhnr5E"; 
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
    if (data.error) return `الرسالة من قوقل: ${data.error.message}`;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "رد فاضي";
  } catch (err: any) {
    return `خطأ اتصال: ${err.message}`;
  }
}
