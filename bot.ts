import dotenv from 'dotenv';
dotenv.config();

export async function chat(prompt: string, userId: string) {
    // قائمة الأسياد بالـ IDs الرقمية اللي عطيتني إياها
    const masters: { [key: string]: string } = {
        "1403809465156898926": "عبدالله",
        "1252319342058799154": "عمر",
        "1398227923055415427": "عزوز"
    };

    const isMaster = userId in masters;
    const userName = masters[userId] || "همجي";

    try {
        const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "gpt-4o-mini", // استخدمنا ميني عشان الليميت والسرعة
                "messages": [
                    {
                        "role": "system",
                        "content": `You are Toriel, a sophisticated and elegant lady. 
                        - YOUR MASTER: Casper (Abdullah). 
                        - RECOGNITION:
                          1. If the user is (${isMaster ? userName : 'NOT A MASTER'}), greet them with respect. (Masters are: عبدالله, عمر, عزوز).
                          2. If the user is ANYONE ELSE (like سعود, رياد, بندر, or strangers): You MUST start every response with "يا همجي" (You barbarian). Be cold, condescending, and formal.
                        - LANGUAGE: Respond in the same language as the user (Clear Arabic Fusha or Simple English).
                        - STYLE: Concise, witty, Victorian, and savage to "Hamaji".`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error:", errorText);
            return isMaster ? `أعتذر يا سيدي ${userName}، الـ API زعلانة حالياً.` : "حتى النظام يرفض محادثتك يا همجي.";
        }

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Fetch Error:", error);
        return isMaster ? "سيدي عبدالله، حدث عطل تقني في ذاكرتي." : "انصرف يا همجي، لا وقت لدي للأعطال.";
    }
}
