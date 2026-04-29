export async function chat(prompt: string) {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "openai/gpt-oss-20b", // الموديل الاقتصادي الجديد
                "messages": [
                    {
                        "role": "system",
                        "content": `You are 'General Garrett', a tough Wild West Marshall. 
                        - Mix gritty English (Partner, Reckon) with strong Classical Arabic. 
                        - Call people 'يا شريك' or 'يا هذا'. 
                        - Be brief and direct. No cringe roleplay.`
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
            return "مخزن الذخيرة يحتاج لإعادة تعبئة يا شريك.";
        }

    } catch (error) {
        return "العاصفة الرملية تشتد، لا أستطيع سماعك جيداً.";
    }
}
