export async function chat(prompt: string, userId: string) {
    const masters: { [key: string]: string } = {
        "1403809465156898926": "عبدالله",
        "1252319342058799154": "عمر",
        "1398227923055415427": "عزوز"
    };
    const hamajiList = ["1448166189120356487", "1338869079284645892", "1323322184843788332", "1325008579979247626"];
    const isMaster = userId in masters;
    const isHamaji = hamajiList.includes(userId);

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Mixtral أذكى من اللاما وما عنده زهايمر ولغته العربية محترمة
                "model": "mixtral-8x7b-32768", 
                "messages": [
                    {
                        "role": "system",
                        "content": `You are Toriel, a high-class Victorian lady. 
                        - If Master (${isMaster ? masters[userId] : 'None'}): Talk like a loyal queen to her king.
                        - If Barbarian (${isHamaji}): Start with "يا همجي" and be savage.
                        - Language: Formal Arabic (العربية الفصحى الجزلة).`
                    },
                    { "role": "user", "content": prompt }
                ]
            })
        });

        const data: any = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        return isMaster ? "عذراً سيدي، أصاب القصر مسٌّ من الجنون." : "انصرف يا رجل الكهف!";
    }
}
