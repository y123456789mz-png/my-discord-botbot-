export async function chat(history: ChatMessage[]): Promise<string> {
  // تأكد إن المفتاح يبدأ بـ AIza
  const apiKey = "AIzaSyDNg1dbkerx1WIipn5CILC23L49SHUh8iM"; 
  
  // غيرنا اسم الموديل ليكون النسخة الأكثر استقراراً
  const model = "gemini-1.5-flash-latest"; 

  try {
    // جربنا نغير v1beta إلى v1 لأنها أضمن
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
    
    // هذا السطر عشان لو طلع خطأ نعرفه بالضبط
    if (data.error) return `خطأ من قوقل: ${data.error.message}`;
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "لم يتم استلام رد.";
  } catch (err: any) {
    return `فشل الاتصال: ${err.message}`;
  }
}
