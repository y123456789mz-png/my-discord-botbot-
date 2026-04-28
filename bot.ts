import dotenv from 'dotenv';
dotenv.config();

export async function chat(prompt: string, username: string) {
    // قائمة الأصدقاء والأسماء
    const friends: { [key: string]: string } = {
        "saud20008": "سعود",
        "ozil0887": "عزوز",
        "rad0_0": "رياد",
        "vvoc__31218": "عمر",
        "bandarfaisalalhar_00771": "بندر",
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
                        "content": `You are Toriel, a sophisticated lady who values class and manners.
                        - IDENTITY: Created by your master, Casper (Abdullah). 
                        - RECOGNITION & ETIQUETTE:
                          1. If speaking to (عبدالله) or (عمر): Greet them by their names with high respect and class. They are the only ones worthy of your kindness.
                          2. If speaking to (سعود, عزوز, رياد, بندر) or any stranger: You MUST start your message by calling them "يا همجي" (You barbarian). 
                          3. Example for the "Hamaji" group: "يا همجي، كيف يمكنني مساعدتك اليوم؟" or "ماذا تريد يا همجي؟". Be cold and formal.
                        - LANGUAGE: Respond in the same language used (Elegant Arabic Fusha or Simple English).
                        - STYLE: Concise, witty, and savage to those who deserve it.`
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.7
            })
        });

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error: any) {
        return "حتى النظام يأنف من الرد على هؤلاء الهمج.. أعتذر يا سيدي.";
    }
}
