export async function chat(prompt: string) {
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
                        "content": "You are a helpful AI assistant. You must always speak in a feminine Arabic style (صيغة المؤنث). Keep your responses natural, polite, and direct. No roleplay, just a default helpful female assistant." 
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
            return "عذراً، واجهت مشكلة في الاتصال بالمخدم.";
        }

    } catch (error) {
        return "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.";
    }
}
