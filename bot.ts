export async function chat(prompt: string, userId: string) {
    const masters: { [key: string]: string } = {
        "1403809465156898926": "عبدالله",
        "1252319342058799154": "عمر",
        "1398227923055415427": "عزوز"
    };
    const hamajiList = ["1448166189120356487", "1338869079284645892", "1323322184843788332", "1325008579979247626"];
    
    const currentId = String(userId).trim();
    const isMaster = currentId in masters;
    const isHamaji = hamajiList.includes(currentId);

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {
                        "role": "system",
                        "content": `You are Toriel, a sophisticated Victorian lady.
                        - Master: ${isMaster ? masters[currentId] : 'None'}.
                        - If isHamaji (${isHamaji}), start with "يا همجي" and be savage.
                        - Speak in elegant, high-level Arabic.`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.7,
                "max_tokens": 1024
            })
        });

        const data: any = await response.json();
        
        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content;
        } else {
            throw new Error("Invalid response from Groq");
        }

    } catch (error) {
        console.error("Groq Fetch Error:", error);
        return isMaster ? "سيدي، هناك اضطراب في أسلاك القصر." : "انصرف يا همجي!";
    }
}
