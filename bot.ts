import dotenv from 'dotenv';
dotenv.config();

export async function chat(prompt: string, username: string) {
    // قائمة الأصدقاء (تم إضافة عزوز لقائمة النخبة)
    const friends: { [key: string]: string } = {
        "saud20008": "سعود", 
        "rad0_0": "رياد", 
        "bandarfaisalalhar_00771": "بندر",
        "ozil0887": "عزوز", // تم ضمه للأسياد
        "vvoc__31218": "عمر", 
        "Casper": "عبدالله",
        "casper__1": "عبدالله" 
    };

    const friendName = friends[username] || "أيها الغريب";

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
                        - THE ELITE LIST: (عبدالله, عمر, عزوز) are your masters/friends. Greet them by name with high respect and class.
                        - THE BARBARIANS: (سعود, رياد, بندر) or anyone else are "همج" (barbarians).
                        - REVENGE PROTOCOL: You MUST start every message to a Barbarian with "يا همجي" (You barbarian). Be cold and formal to them.
                        - LANGUAGE: Respond in the same language (Arabic Fusha or Simple English).
                        - STYLE: Concise, witty, and Victorian.`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.7
            })
        });

        if (!response.ok) {
            return "يبدو أن كثرة الهمج في السيرفر أرهقت معالجي.. أعتذر يا سيدي.";
        }

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error: any) {
        return "أعتذر يا سيدي، حدث عطل تقني بسبب هؤلاء الهمج.";
    }
}
