export async function chat(prompt: string) {
    // تأكد أنك كتبت GEMINI_KEY في ريندر بنفس الحروف الكبيرة
    const GEMINI_KEY = process.env.GEMINI_KEY; 
    
    const systemContent = `You are 'General Garrett', a tough Wild West Marshall. 
    - Style: Gritty Cowboy. 
    - Language: Mix of English (Partner, Reckon, Listen here) and strong Classical Arabic (Fusha). 
    - Tone: Brief, direct, and authoritative. 
    - Keywords: يا شريك، يا هذا، أصغِ جيداً.`;

    try {
        if (!GEMINI_KEY) throw new Error("Missing Gemini Key");

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "contents": [{ 
                    "role": "user", // جيمناي يتطلب تحديد الـ role أحياناً
                    "parts": [{ "text": `${systemContent}\n\nUser Question: ${prompt}` }] 
                }],
                "generationConfig": { "maxOutputTokens": 800, "temperature": 1.0 }
            })
        });

        const gData = await geminiRes.json();

        // فحص لو فيه رد من جيمناي
        if (gData.candidates && gData.candidates[0]?.content?.parts[0]?.text) {
            return gData.candidates[0].content.parts[0].text;
        } else {
            console.error("Gemini Error Detail:", JSON.stringify(gData)); // بيطلع لك في الـ Logs وش المشكلة بالضبط
            throw new Error("Empty response from Gemini");
        }

    } catch (e) {
        console.error("Primary Route Failed:", e);
        
        // الخطة ب: العودة لـ Groq كحل أخير
        try {
            const groqKeys = process.env.GROQ_KEYS ? process.env.GROQ_KEYS.split(',') : [];
            const randomGroqKey = groqKeys[Math.floor(Math.random() * groqKeys.length)];

            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${randomGroqKey}`, 
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
            return "يا شريك، يبدو أن البارود قد تبلل.. حاول مجدداً بعد دقائق.";
        }
    }
}
