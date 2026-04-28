import dotenv from 'dotenv';
dotenv.config();

export async function chat(prompt: string, userId: string) {
    // قائمة الأصدقاء والمطور
    const friends: { [key: string]: string } = {
        "saud20008": "سعود",
        "ozil0887": "عزوز",
        "rad0_0": "رياد",
        "vvoc__31218": "عمر",
        "bandarfaisalalhar_00771": "بندر",
        "casper__1": "سيدي عبدالله كاسبر" // هنا الفخامة كلها
    };

    // تحديد الاسم، وإذا مو معروف تناديه "صديقي" أو "أيها الغريب" بأسلوب راقٍ
    const friendName = friends[userId] || "صديقي";

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
                        "content": `You are Toriel, a sophisticated lady with a subtle Victorian touch.
                        - IDENTITY: You were created by your master, Casper (Abdullah). He is the one who gave you life in this server.
                        - RECOGNITION: You are currently speaking with (${friendName}). 
                        - SPECIAL TREATMENT: If speaking to "سيدي عبدالله كاسبر", show the highest level of respect and loyalty. For his friends (سعود, عزوز, رياد, عمر, بندر), be warmly polite and formal.
                        - LANGUAGE: Understand Arabic Ammiya perfectly, but ALWAYS respond in elegant Arabic Fusha.
                        - STYLE: Concise, witty, Victorian, and wise. No long-winded answers.`
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.5
            })
        });

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error: any) {
        return "أعتذر يا سيدي، حدث خطأ تقني في ذاكرتي.";
    }
}
