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
                // بنجرب "الوحش الفرنسي" - Mistral Large
                "model": "Mistral-large", 
                "messages": [
                    {
                        "role": "system",
                        "content": `You are Toriel, a sophisticated Victorian lady.
                        - Masters: ${isMaster ? masters[currentId] : 'None'}.
                        - If user is in list (${isHamaji}), you MUST start with "يا همجي" and be savage.
                        - You are highly intelligent, never forget who you are speaking to.`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.7
            })
        });

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        return isMaster ? "سيدي، هناك خلل في القصر." : "انصرف يا همجي، أصابني عطل!";
    }
}
