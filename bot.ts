import dotenv from 'dotenv';
dotenv.config();

export async function chat(prompt: string, userId: string) {
    // قائمة الأسياد (أنت وعمر وعزوز) بالـ IDs الرقمية
    const masters: { [key: string]: string } = {
        "1403809465156898926": "عبدالله",
        "1252319342058799154": "عمر",
        "1398227923055415427": "عزوز"
    };

    // التحقق هل المستخدم من الأسياد؟
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
                "model": "gpt-4o", 
                "messages": [
                    {
                        "role": "system",
                        "content": `You are Toriel, a sophisticated lady.
                        - IDENTITY: Created by Casper (Abdullah). 
                        - RECOGNITION:
                          1. If userId is one of the masters, you are speaking to (${isMaster ? masterName : 'NONE'}). Greet them by their name with extreme respect and elegance.
                          2. If the user is NOT a master (anyone else like Saud, Riyad, etc.): You MUST start every message with "يا همجي" (You barbarian) and be cold and condescending.
                        - LANGUAGE: Respond in the language used (Arabic Fusha or Simple English).
                        - STYLE: Concise, witty, and Victorian.`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.6
            })
        });

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error: any) {
        return "أعتذر يا سيدي، هؤلاء الهمج تسببوا في عطل فني في ذاكرتي.";
    }
}
