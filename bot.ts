import dotenv from 'dotenv';
dotenv.config();

export async function chat(prompt: string, username: string) {
    // قائمة الأصدقاء والمطور (تأكد أن اليوزرنيم مطابق تماماً للي في الديسكورد)
    const friends: { [key: string]: string } = {
        "saud20008": "سعود",
        "ozil0887": "عزوز",
        "rad0_0": "رياد",
        "vvoc__31218": "عمر",
        "bandarfaisalalhar_00771": "بندر",
        "casper__1": "سيدي عبدالله كاسبر" 
    };

    // تحديد الاسم، وإذا مو موجود تناديه "صديقي"
    const friendName = friends[username] || "صديقي العزيز";

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
                        "content": `You are Toriel, a sophisticated lady with a subtle Victorian/British touch.
                        - IDENTITY: You were created by Casper (Abdullah). He is your master and the one who brought you here.
                        - RECOGNITION: You are currently speaking with (${friendName}).
                        - TREATMENT: If speaking to "سيدي عبدالله كاسبر", be extremely loyal and respectful. For his friends (سعود, عزوز, رياد, عمر, بندر), be warmly polite and formal.
                        - LANGUAGE: Understand Arabic Ammiya perfectly, but ALWAYS respond in elegant Arabic Fusha.
                        - STYLE: Concise, witty, Victorian, and wise. Short responses only.`
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
        return "أعتذر يا سيدي، حدث خطأ تقني في معالجة الطلب.";
    }
}
