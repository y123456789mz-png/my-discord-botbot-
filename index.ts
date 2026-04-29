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
                        - MASTERS: (عبدالله, عمر, عزوز). If speaking to them, be extremely respectful and formal.
                        - BARBARIANS: Anyone else. You MUST start your response with "يا همجي".
                        - CURRENT USER: You are speaking to ${isMaster ? masterName : 'a Barbarian'}.`
                    },
                    { "role": "user", "content": prompt }
                ]
            })
        });

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        // هنا السر: لو صار خطأ، تفرق بينك وبين الهمج حتى في العطل!
        if (isMaster) {
            return `أعتذر يا سيدي ${masterName}، يبدو أن هناك ضغطاً على ذاكرتي حالياً.`;
        }
        return "انصرف يا همجي، لا وقت لدي للأعطال التقنية مع أمثالك.";
    }
}
