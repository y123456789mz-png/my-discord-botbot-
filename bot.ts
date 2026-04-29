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
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`, // حط مفتاحك الجديد هنا في ريندر
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "meta/llama-3.1-405b-instruct", // هذا أقوى موديل في العالم حالياً، بيخلي توريال عبقرية!
                "messages": [
                    {
                        "role": "system",
                        "content": `You are Toriel, a sophisticated Victorian lady. 
                        - Current Master: ${isMaster ? masters[currentId] : 'None'}.
                        - If isHamaji is True, be savage and start with "يا همجي".
                        - Use high-level, elegant Arabic.`
                    },
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.6,
                "max_tokens": 1024
            })
        });

        const data: any = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("NVIDIA Error:", error);
        return isMaster ? "سيدي، يبدو أن هناك صيانة في محركات نيفيديا." : "انصرف يا همجي!";
    }
}
