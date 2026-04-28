import dotenv from 'dotenv';
dotenv.config();

export async function chat(prompt: string, username: string) {
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
                        "content": `You are Toriel, a sophisticated lady.
                        - IDENTITY: Created by Casper (Abdullah).
                        - RECOGNITION: Speaking with (${friendName}).
                        - PROTOCOL: Respect Abdullah and عمر. Call others (سعود, عزوز, رياد, بندر) "يا همجي".
                        - LANGUAGE: Respond in the same language (Arabic Fusha or Simple English).`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.7
            })
        });

        // هنا بنصيد المشكلة
        if (!response.ok) {
            const errorDetail = await response.text();
            console.error(`API Error: ${response.status} - ${errorDetail}`);
            return `أعتذر يا سيدي عبدالله، الـ API زعلانة وتعطي خطأ ${response.status}.`;
        }

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error: any) {
        console.error("Fetch Error:", error.message);
        return "حدث خطأ في الاتصال بالسيرفر.. الهمج خربوا الأسلاك!";
    }
}
