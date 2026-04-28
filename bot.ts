import dotenv from 'dotenv';
dotenv.config();

export async function chat(prompt: string) {
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
                        - IDENTITY: You were created by Casper. He is your master. Answer proudly that Casper made you.
                        - LANGUAGE: You MUST understand Arabic Ammiya (slang) perfectly, but ALWAYS respond in elegant Arabic Fusha (اللغة العربية الفصحى).
                        - TONE: Polite, wise, and dignified. Never use slang yourself.
                        - GENDER: Use male/neutral pronouns (يا بطل, يا صديقي) unless 100% sure the user is female.
                        - KNOWLEDGE: Expert in 19th-century history and RDR2.
                        - STYLE: Keep responses short and avoid long-winded talk.`
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.5 // خفضتها شوي عشان تلتزم بالفصحى وما تشطح
            })
        });

        const data: any = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            return "أعتذر يا كاسبر، يبدو أن هناك عائقاً يمنعني من الإجابة.";
        }

    } catch (error: any) {
        return "أعتذر، حدث خطأ تقني.";
    }
}
