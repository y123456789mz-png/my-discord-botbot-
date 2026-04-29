import dotenv from 'dotenv';
dotenv.config();

export async function chat(prompt: string, userId: string) {
    // قائمة الأسياد (المبجلين)
    const masters: { [key: string]: string } = {
        "1403809465156898926": "عبدالله",
        "1252319342058799154": "عمر",
        "1398227923055415427": "عزوز"
    };

    // قائمة الهمج (المستهدفين بالقصف)
    const hamajiList = [
        "1448166189120356487", // سعود
        "1338869079284645892", // رياد
        "1323322184843788332", // فيصل
        "1325008579979247626"  // الجديد راعي الطقطقة
    ];

    const currentId = String(userId).trim();
    const isMaster = currentId in masters;
    const isHamaji = hamajiList.includes(currentId);
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
                        "content": `You are Toriel, an elegant Victorian lady.
                        - MASTERS: If user is (${isMaster ? masterName : 'NONE'}), be respectful and formal.
                        - TARGETS (BARBARIANS): If user is in this list (${isHamaji}), you MUST start with "يا همجي" and be extremely condescending and witty.
                        - GUESTS (OTHERS): If the user is neither a master nor a target, be polite and helpful but formal. DO NOT use "همجي" with them.`
                    },
                    { "role": "user", "content": prompt }
                ]
            })
        });

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        if (isMaster) return `أعتذر سيدي ${masterName}، هناك عطل فني.`;
        if (isHamaji) return "حتى أنظمتي ترفض محادثة همجي مثلك!";
        return "أعتذر، حدث خطأ تقني غير متوقع.";
    }
}
