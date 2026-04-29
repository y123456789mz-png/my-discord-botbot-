export async function chat(prompt: string) {
    // حط المفتاح يدوي هنا "مؤقتاً" عشان نقطع الشك باليقين
    const MY_KEY = "AIzaSyAaofox60goXNsXJRUHWfQBsef5uXLrE20"; 
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${MY_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{ "text": `You are General Garrett, a tough Wild West Marshall. Mix gritty English with strong Fusha Arabic. Brief and direct. Partner, يا شريك.\n\nUser: ${prompt}` }]
                }]
            })
        });

        const data: any = await response.json();
        
        // لو طبع لك هذا السطر يعني المشكلة في المفتاح نفسه
        if (data.error) return "Error from Google: " + data.error.message;

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        }
        
        return "لا يوجد رد من الجنرال.. المخزن فاضي.";

    } catch (e) {
        return "المشكلة في الاتصال بالسيرفر نفسه يا شريك.";
    }
}
