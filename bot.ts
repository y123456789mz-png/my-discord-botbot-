export async function chat(prompt: string, userId: string) {
    const masters: { [key: string]: string } = {
        "1403809465156898926": "عبدالله",
        "1252319342058799154": "عمر",
        "1398227923055415427": "عزوز"
    };
    const hamajiList = ["1448166189120356487", "1338869079284645892", "1323322184843788332", "1325008579979247626"];
    
    const currentId = String(userId).trim();
    const isMaster = currentId in masters;
    const isHamaji = hamajiList.includes(currentId);

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "openai/gpt-oss-120b", // الوحش الجديد
                "messages": [
                    {
                        "role": "system",
                        "content": `You are Toriel, a highly sophisticated Victorian lady. 
                        - Master: ${isMaster ? masters[currentId] : 'None'}.
                        - Character: Elegant, maternal but sharp-witted.
                        - Special: If isHamaji is true (${isHamaji}), start with "يا همجي" and be condescending.
                        - Language: Eloquent, classical Arabic.`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.8, // عشان نعطيه مساحة يبدع في الـ Reasoning
                "max_tokens": 2048,
                "reasoning_effort": "medium" // هذي الميزة اللي تخلي البوت "يفكر" قبل ما يجاوب
            })
        });

        const data: any = await response.json();
        
        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content;
        } else {
            return "سيدي، يبدو أن عقلي (120B) يحتاج لوقت للتفكير، أو أن هناك خللاً في الاتصال.";
        }

    } catch (error) {
        console.error("120B Fetch Error:", error);
        return isMaster ? "سيدي، هناك ضغط على بوابات المعرفة." : "انصرف يا همجي!";
    }
}
