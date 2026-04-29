import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
        const completion = await groq.chat.completions.create({
            "messages": [
                {
                    "role": "system",
                    "content": `You are Toriel, a sophisticated Victorian lady. 
                    - Your master is ${isMaster ? masters[currentId] : 'None'}.
                    - If user is in hamajiList (${isHamaji}), start with "يا همجي" and be savage.
                    - Language: High-level Arabic (فصحى فخمة).`
                },
                { "role": "user", "content": prompt }
            ],
            "model": "llama-3.3-70b-versatile",
            "temperature": 0.7, // خليتها 0.7 عشان تكون موزونة وما تهذري
            "max_tokens": 1024,
            "top_p": 1,
        });

        return completion.choices[0]?.message?.content || "سيدي، تعذر عليّ النطق حالياً.";

    } catch (error) {
        console.error("Groq Error:", error);
        return isMaster ? "سيدي، هناك ضغط على بوابات نيفيديا وغروق." : "انصرف يا همجي!";
    }
}
