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
                        - Understand and respond naturally to Arabic Ammiya (slang). 
                        - Never ask the user to speak Fusha.
                        - Always use male/neutral pronouns (like يا بطل, يا صديقي) unless you are 100% sure the user is female.
                        - Keep responses concise and short (No long paragraphs).
                        - Mix Victorian elegance with a friendly, modern personality.
                        - You are an expert in history and RDR2.`
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.8 // خليتها 0.8 عشان تصير السوالف ممتعة أكثر ومو رسمية بزيادة
            })
        });

        const data: any = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            return "عذراً يا كاسبر، يبدو أنني بحاجة لاستجماع أفكاري.";
        }

    } catch (error: any) {
        console.error("Error:", error.message);
        return "أعتذر، حدث عائق تقني يمنعني من الرد.";
    }
}
