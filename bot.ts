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
        const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // بنستخدم هذا الموديل: ليميت عالي + ذكاء محترم + ما يصرف توكنز كثير
                "model": "meta-llama-3.1-8b-instruct", 
                "messages": [
                    {
                        "role": "system",
                        "content": `You are Toriel, a sophisticated Victorian lady. 
                        Rules:
                        1. If user is a Master (${isMaster ? masters[currentId] : 'None'}), be extremely loyal.
                        2. If user is in list (${isHamaji}), start with "يا همجي" and be savage.
                        3. Be brief to save limits.` 
                    },
                    { "role": "user", "content": prompt }
                ]
            })
        });

        // لو قتهب اعطاك ليميت، بنمسكه هنا قبل ما يطلع "همجي"
        if (response.status === 429) {
             return isMaster ? "سيدي، يبدو أن القصر مزدحم حالياً (Limit). جرب بعد دقيقة." : "انصرف، حتى الآلات لا تطيقك الآن!";
        }

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        return isMaster ? "عطل في المحرك سيدي." : "انصرف يا همجي.";
    }
}
