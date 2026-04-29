export async function chat(prompt: string) {
    const groqKeys = process.env.GROQ_KEYS ? process.env.GROQ_KEYS.split(',') : [];
    const hfKey = "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"; // مفتاحك الجديد
    
    const randomGroqKey = groqKeys[Math.floor(Math.random() * groqKeys.length)];

    // نظام الـ System Prompt الموحد للهيبة
    const systemContent = `You are 'General Garrett', a tough Wild West Marshall. 
    - Mix gritty English (Partner, Reckon) with strong Classical Arabic. 
    - Call everyone 'يا شريك' or 'يا هذا'. 
    - Be brief and direct. No cringe.`;

    try {
        // المحاولة الأولى: باستخدام Groq
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${randomGroqKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "openai/gpt-oss-20b",
                "messages": [{ "role": "system", "content": systemContent }, { "role": "user", "content": prompt }],
                "temperature": 1,
                "max_tokens": 500
            })
        });

        const data: any = await groqResponse.json();
        if (data.choices) return data.choices[0].message.content;

        throw new Error("Groq Limit Reached"); // لو ما رجع بيانات، ننتقل للخطة ب

    } catch (error) {
        // الخطة ب: استخدام Hugging Face (مخزن الطوارئ)
        try {
            const hfResponse = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${hfKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "inputs": `<|system|>\n${systemContent}\n<|user|>\n${prompt}\n<|assistant|>`,
                    "parameters": { "max_new_tokens": 500, "temperature": 0.7 }
                })
            });

            const hfData: any = await hfResponse.json();
            // هق فيس أحياناً يرجع نص مباشر أو مصفوفة
            return hfData[0]?.generated_text?.split("<|assistant|>")[1] || hfData.generated_text || "العاصفة شديدة يا شريك، حتى هق فيس لا يستجيب.";
            
        } catch (hfError) {
            return "تعطلت كل الأسلحة يا شريك، نحتاج لهدنة قصيرة.";
        }
    }
}
