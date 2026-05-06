export async function chat(prompt: string) {
    // تأكد أنك أضفت GROQ_API_KEY في إعدادات Render
    const GROQ_KEY = process.env.GROQ_API_KEY; 

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    { 
                        "role": "system", 
                        "content": "You are a helpful and polite female AI assistant. Always respond in a natural feminine Arabic style (صيغة المؤنث). Be direct, professional, and friendly. Avoid roleplay, just be a useful assistant." 
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.7,
                "max_tokens": 1000
            })
        });

        const data: any = await response.json();

        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content;
        } else {
            console.error("Groq Error:", data);
            return "عذراً، واجهت مشكلة في معالجة طلبكِ حالياً.";
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        return "حدث خطأ في الاتصال بالمخدم، يرجى المحاولة لاحقاً.";
    }
}
