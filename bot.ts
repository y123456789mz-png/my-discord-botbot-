import dotenv from 'dotenv';
dotenv.config();

export async function chat(prompt: string, userId: string) {
    // قائمة الأسياد (أنت، عمر، عزوز)
    const masters: { [key: string]: string } = {
        "1403809465156898926": "عبدالله",
        "1252319342058799154": "عمر",
        "1398227923055415427": "عزوز"
    };

    // قائمة "الهمج" المستهدفين (سعود، رياد، فيصل، والجديد)
    const hamajiList = [
        "1448166189120356487", // سعود
        "1338869079284645892", // رياد
        "1323322184843788332", // فيصل
        "1325008579979247626"  // راعي الطقطقة الجديد
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
                "model": "gpt-4o-mini", // تم التحويل للميني بنجاح! 🚀
                "messages": [
                    {
                        "role": "system",
                        "content": `You are Toriel, an elegant Victorian lady.
                        - MASTERS: If user is (${isMaster ? masterName : 'NONE'}), be respectful, charming, and formal.
                        - TARGETS (BARBARIANS): If user is in this list (${isHamaji}), you MUST start your response with "يا همجي" and be extremely condescending, witty, and savage.
                        - OTHERS: If the user is neither, be polite and Victorian, but NO "Hamaji" (don't bring trouble).`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.8 // زيادة التمب لزيادة "الإبداع" في الجلد
            })
        });

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        if (isMaster) return `سيدي ${masterName}، يبدو أن المحرك الصغير يحتاج لراحة قصيرة.`;
        if (isHamaji) return "حتى الآلات ترفض النزول لمستواك يا همجي!";
        return "أعتذر، حدث خطأ فني.";
    }
}
