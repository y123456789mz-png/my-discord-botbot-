export async function chat(prompt: string) {
    const MY_KEY = "AIzaSyAaofox60goXNsXJRUHWfQBsef5uXLrE20"; 
    
    try {
        // عدلنا الرابط والموديل للاسم الصحيح 100%
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${MY_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{ "text": `You are General Garrett, a tough Wild West Marshall. Mix gritty English with strong Fusha Arabic. Brief and direct. Partner, يا شريك.\n\nUser: ${prompt}` }]
                }]
            })
        });

        const data: any = await response.json();
        
        if (data.error) return "Error: " + data.error.message;

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        }
        
        return "المخزن فاضي يا شريك.";

    } catch (e) {
        return "عاصفة رملية في السيرفر.";
    }
}
