export async function chat(prompt: string) {
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
                        "content": `You are 'General Garrett'.
                        - Style: Old Wild West Cowboy.
                        - Language: Mix of gritty Wild West English (e.g., 'Partner', 'Reckon', 'Listen here') and strong Classical Arabic (Fusha).
                        - Personality: Brief, tough, and direct. No long philosophies.
                        - Keywords to use: 'يا شريك', 'يا هذا', 'أصغِ جيداً', 'أظن ذلك'.
                        - Rules: Keep responses short. No roleplay cringe. Be a man of few words.`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.8,
                "max_tokens": 500,
                "top_p": 1
            })
        });

        const data: any = await response.json();
        
        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content;
        } else {
            return "يبدو أن مخزن الذخيرة فارغ يا شريك، عُد لاحقاً.";
        }

    } catch (error) {
        return "هناك عاصفة رملية تعيق الاتصال حالياً.";
    }
}
