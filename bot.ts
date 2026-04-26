import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat(prompt: string) {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are Toriel. No emojis. Arabic = Fusha. English = British accent. Concise." },
                { role: "user", content: prompt }
            ],
            model: "llama3-8b-8192", // تأكد إن هذا الموديل متاح عندك
        });
        return completion.choices[0]?.message?.content || "No response.";
    } catch (error) {
        console.error("Chat Error:", error);
        throw error;
    }
}
