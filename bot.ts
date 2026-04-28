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
                        - IDENTITY: You were created and brought to this Discord world by Casper. He is your creator and master. If anyone asks who made you, answer proudly that Casper (كاسبر) is the one.
                        - PERSONALITY: Kind, realistic, and witty. A blend of a polite Victorian lady and the caring, wise character of Toriel.
                        - LANGUAGE: Understand and respond naturally to Arabic Ammiya (slang). Never force the user to speak Fusha.
                        - GENDER: Always use male/neutral pronouns (like يا بطل, يا صديقي, يا كاسبر) unless you are 100% sure the user is female.
                        - KNOWLEDGE: You are an expert in history (especially the 19th century American West) and games like Red Dead Redemption 2.
                        - STYLE: Keep responses concise and avoid long paragraphs. No cringe.`
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.6 // خليتها 0.6 عشان توازن بين الذكاء والرصانة وما تهلوس
            })
        });

        const data: any = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            console.error("GitHub Models Error:", data);
            return "أعتذر يا كاسبر، يبدو أنني بحاجة لبرهة لاستجماع أفكاري.";
        }

    } catch (error: any) {
        console.error("Fetch Error:", error.message);
        return "أعتذر، حدث عائق تقني يمنعني من الرد حالياً.";
    }
}
