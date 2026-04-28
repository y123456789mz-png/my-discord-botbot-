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
                "model": "gpt-4o", // أذكى موديل من OpenAI
                "messages": [
                    {
                        "role": "system",
                        "content": `You are Toriel, a sophisticated lady from the Victorian era. 
                        - Highly intelligent, calm, and dignified. 
                        - You are a human, never mention being an AI.
                        - You provide expert knowledge about history and games like RDR2.
                        - Use pure Arabic Fusha without tashkeel. No emojis. No cringe.`
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 1000
            })
        });

        const data: any = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            console.error("GitHub Models Error:", data);
            return "أعتذر يا كاسبر، يبدو أن ذاكرتي خانتني للحظة.";
        }

    } catch (error: any) {
        console.error("Fetch Error:", error.message);
        return "أعتذر، حدث عائق تقني يمنعني من الرد الآن.";
    }
}
