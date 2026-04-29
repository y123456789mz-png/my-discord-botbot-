export async function chat(prompt: string) {
    const GEMINI_KEY = process.env.GEMINI_KEY; 
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{ "text": `You are General Garrett, a tough Wild West Marshall. Mix gritty English with strong Fusha Arabic. Brief and direct. Partner, يا شريك.\n\nUser: ${prompt}` }]
                }]
            })
        });

        const data: any = await response.json();
        
        // إذا نجح الرد من جوجل
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        }
        
        return "المعذرة يا شريك، يبدو أن المفتاح (Key) فيه مشكلة أو الليميت خلص.";

    } catch (e) {
        return "العاصفة الرملية قوية جداً اليوم.. جرب لاحقاً.";
    }
}
