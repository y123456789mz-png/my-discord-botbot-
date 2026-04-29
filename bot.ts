import dotenv from 'dotenv';
dotenv.config();

export async function chat(prompt: string, userId: string) {
    // طال عمرك، هذه الـ IDs حقتكم
    const masters: { [key: string]: string } = {
        "1403809465156898926": "عبدالله",
        "1252319342058799154": "عمر",
        "1398227923055415427": "عزوز"
    };

    // سطر كشف الفضائح: بيطبع في ريندر وش الرقم اللي وصل للبوت فعلياً
    console.log(`Received User ID: [${userId}]`);

    // التأكد من الهوية (تحويل الـ ID لنص عشان المطابقة تكون دقيقة)
    const currentId = String(userId).trim();
    const isMaster = currentId in masters;
    const masterName = masters[currentId];

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
                        - MASTERS: ${JSON.stringify(masters)}.
                        - YOUR CURRENT CONVERSATION: You are speaking with ${isMaster ? masterName : 'a Barbarian'}.
                        - RULE: If the user is a master, be extremely respectful. If NOT, start with "يا همجي".`
                    },
                    { "role": "user", "content": prompt }
                ]
            })
        });

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        if (isMaster) return `أعتذر يا سيدي ${masterName}، الذاكرة معطلة.`;
        return "انصرف يا همجي، لا وقت للأعطال.";
    }
}
