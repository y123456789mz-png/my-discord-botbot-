export async function chat(history: any[]): Promise<string> {
  const apiKey = "AIzaSyAudb_O-Al-ld5GfFIm03EXsbvwWqqmAik"; 
  
  // الرابط الرسمي والمباشر لموديل Flash
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
      return `خطأ مباشر من قوقل (${data.error.code}): ${data.error.message}`;
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "رد فاضي، جرب مرة ثانية.";
  } catch (err: any) {
    return `فشل الاتصال: ${err.message}`;
  }
}
