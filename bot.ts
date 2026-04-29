export async function chat(prompt: string, userId: string) {
    const users: { [key: string]: string } = {
        "1403809465156898926": "عبدالله",
        "1252319342058799154": "عمر",
        "1398227923055415427": "عزوز"
    };
    
    const currentId = String(userId).trim();
    const userName = users[currentId] || "صديقي";

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "openai/gpt-oss-120b",
                "messages": [
                    {
                        "role": "system",
                        "content": `أنت مساعد ذكي ومباشر. الشخص الذي تتحدث معه هو ${userName}. كن طبيعياً في ردودك ولا تتصنع أي شخصية.`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 1,
                "max_completion_tokens": 8192,
                "top_p": 1,
                "reasoning_effort": "medium"
            })
        });

        const data: any = await response.json();
        
        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content;
        } else {
            return "عذراً يا " + userName + "، واجهت مشكلة في معالجة الطلب.";
        }

    } catch (error) {
        console.error("Error:", error);
        return "سيدي، هناك مشكلة في الاتصال بالسيرفر حالياً.";
    }
}
