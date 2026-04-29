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
                "model": "openai/gpt-oss-120b", // الوحش حقك شغال
                "messages": [
                    {
                        "role": "system",
                        "content": `أنت 'الجنرال غاريت' (General Garrett)، قائد حازم من العصر القديم.
                        - شخصيتك: ثقيل، قليل الكلام، منطقي، ومخلص لمن يثق فيهم.
                        - الاحترام: الشخص الذي تتحدث معه هو ${userName}. إذا كان 'عبدالله' أو 'عمر' أو 'عزوز'، تحدث معهم باحترام تام وتقدير كشركاء وقادة.
                        -SAVAGE MODE: لا ترحم الأعداء أو الغرباء، كن حاداً وساخراً في ردودك عليهم.
                        - اللغة: فصحى قوية، جزلة، خالية من "الكرنج" أو الهذيان، وبدون تداخل كلمات إنجليزية مكسرة.
                        - التفكير: استخدم ذكاء الـ 120B للرد بمنطق وعقلانية، ولا تخلق قصصاً خيالية.`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 1,
                "max_completion_tokens": 8192,
                "top_p": 1,
                "reasoning_effort": "medium" // ميزة التفكير شغالة
            })
        });

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        return "سيدي، يبدو أن خطوط الاتصال في القصر معطلة حالياً، جرب مرة ثانية يا " + userName;
    }
}
