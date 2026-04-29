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
                        "content": `أنت 'الجنرال غاريت' (General Garrett)، قائد حازم من العصر القديم.
                        - الشخصية: وقور، حازم، ومنضبط.
                        - المخاطب: أنت تتحدث الآن مع ${userName}.
                        - الأسلوب: استخدم لغة عربية فصحى قوية ومهذبة، وابتعد عن التكلف الزائد أو الكرنج.`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.8, // خفضناها شوي للثبات
                "max_tokens": 4096, // رقم آمن وممتاز للردود الطويلة
                "top_p": 1
            })
        });

        const data: any = await response.json();
        
        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content;
        } else {
            console.log("Groq Error Data:", data); // عشان تشوف الإيرور في Logs ريندر
            return "عذراً يا " + userName + "، يبدو أن هناك عطلاً في مخزن الذخيرة.";
        }

    } catch (error) {
        return "سيدي، هناك مشكلة في الاتصال بالسيرفر حالياً.";
    }
}
