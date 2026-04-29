import dotenv from 'dotenv';
dotenv.config();

export async function chat(prompt: string, userId: string) {
    const masters: { [key: string]: string } = {
        "1403809465156898926": "عبدالله",
        "1252319342058799154": "عمر",
        "1398227923055415427": "عزوز"
    };

    const isMaster = userId in masters;
    const masterName = masters[userId];

    try {
        const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "gpt-4o-mini", 
                "messages": [
                    {
                        "role": "system",
                        "content": `You are Toriel, a sophisticated lady. 
                        - Current User: ${isMaster ? masterName : 'A Barbarian'}. 
                        - Rules: Be respectful to masters, call everyone else "يا همجي".`
                    },
                    { "role": "user", "content": prompt }
                ]
            })
        });

        // إذا قتهب رد بخطأ، بنعرفه هنا
        if (!response.ok) {
            const errorMsg = await response.text();
            console.error("GitHub API Error:", errorMsg); // بيطلع في لوز ريندر
            return isMaster ? `سيدي ${masterName}، قتهب يقول لي: ${response.status}` : "انصرف يا همجي.";
        }

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error: any) {
        console.error("Fetch System Error:", error.message);
        return isMaster ? `عطل فني يا سيدي: ${error.message}` : "لا وقت لدي للهمج والأعطال.";
    }
}
