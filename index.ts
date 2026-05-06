async function chat(prompt: string) {
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
                        "content": "You are a helpful and polite female AI assistant. Always respond in a natural feminine Arabic style (صيغة المؤنث)." 
                    },
                    { "role": "user", "content": prompt }
                ]
            })
        });

        const data: any = await response.json();

        // هذا السطر بيكشف لنا المستور
        if (data.error) {
            return `❌ خطأ من Groq: ${data.error.message}`;
        }

        return data.choices?.[0]?.message?.content || "عذراً، الرد فارغ.";
    } catch (error: any) {
        return `❌ فشل الاتصال: ${error.message}`;
    }
}
