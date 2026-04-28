import dotenv from 'dotenv';
dotenv.config();

export async function chat(prompt: string, userId: string) {
    // استبدل هذه الأرقام بالـ IDs الحقيقية اللي نسختها بالـ كليك يمين
    const eliteIds = [
        "123456789", // الـ ID حقك (عبدالله)
        "987654321", // الـ ID حق عمر
        "112233445"  // الـ ID حق عزوز
    ];

    // قائمة الأسماء للترحيب بالفئة الـ VIP
    const names: { [key: string]: string } = {
        "123456789": "عبدالله",
        "987654321": "عمر",
        "112233445": "عزوز"
    };

    const isElite = eliteIds.includes(userId);
    const friendName = names[userId] || "أيها الهمجي";

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
                        - If the user ID is in the elite list: Greet them as (${friendName}) with high respect.
                        - If the user is NOT in the elite list: You MUST call them "يا همجي" (You barbarian) and be very rude/cold.
                        - Language: Same as user. Style: Concise.`
                    },
                    { "role": "user", "content": prompt }
                ]
            })
        });

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error: any) {
        return "أعتذر يا سيدي، هؤلاء الهمج تسببوا في عطل فني.";
    }
}
