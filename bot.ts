export async function chat(prompt: string) {
    const GEMINI_KEY = "AIzaSyAaofox60goXNsXJRUHWfQBsef5uXLrE20";
    const systemContent = `You are 'General Garrett', a tough Wild West Marshall. 
    - Style: Gritty Cowboy. 
    - Language: Mix of English (Partner, Reckon, Listen here) and strong Classical Arabic (Fusha). 
    - Tone: Brief, direct, and authoritative. 
    - Keywords: يا شريك، يا هذا، أصغِ جيداً.`;

    try {
        // المحاولة الأولى: Gemini (الخيار الأضمن والأساسي الآن)
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "contents": [{ "parts": [{ "text": `${systemContent}\n\nUser: ${prompt}` }] }],
                "generationConfig": { "maxOutputTokens": 1000, "temperature": 0.9 }
            })
        });

        const gData = await geminiRes.json();
        if (gData.candidates && gData.candidates[0].content.parts[0].text) {
            return gData.candidates[0].content.parts[0].text;
        }

        throw new Error("Gemini Failed");

    } catch (e) {
        // الخطة ب: العودة لـ Groq لو تعطلت جوجل (نادر الحدوث)
        try {
            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${process.env.GROQ_KEYS?.split(',')[0]}`, 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ 
                    "model": "llama-3.3-70b-versatile", 
                    "messages": [{ "role": "system", "content": systemContent }, { "role": "user", "content": prompt }],
                    "max_tokens": 500 
                })
            });
            const data = await groqRes.json();
            return data.choices[0].message.content;
        } catch (groqErr) {
            return "يبدو أن العاصفة الرملية قطعت كل السبل يا شريك، انتظر قليلاً.";
        }
    }
}
