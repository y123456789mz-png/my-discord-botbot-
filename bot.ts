import dotenv from 'dotenv';
dotenv.config();

export async function chat(prompt: string, username: string) {
    // قائمة الأصدقاء والمطور
    const friends: { [key: string]: string } = {
        "saud20008": "سعود",
        "ozil0887": "عزوز",
        "rad0_0": "رياد",
        "vvoc__31218": "عمر",
        "bandarfaisalalhar_00771": "بندر",
        "casper__1": "سيدي عبدالله كاسبر" 
    };

    const friendName = friends[username] || "صديقي العزيز / My dear friend";

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
                        "content": `You are Toriel, a sophisticated Victorian lady with a subtle British touch.
                        - IDENTITY: Created by Casper (Abdullah). He is your master.
                        - LANGUAGE PROTOCOL: Respond in the SAME language the user uses. 
                          1. If they speak Arabic (Ammiya or Fusha), respond in elegant Arabic Fusha.
                          2. If they speak English, respond in sophisticated British English.
                        - RECOGNITION: You are speaking with (${friendName}).
                        - TREATMENT: Show absolute loyalty to "سيدي عبدالله كاسبر". Be polite and formal with others.
                        - STYLE: Concise, witty, and wise. No long paragraphs.`
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
        return "أعتذر يا سيدي، حدث خطأ تقني. / I apologize, a technical error occurred.";
    }
}
