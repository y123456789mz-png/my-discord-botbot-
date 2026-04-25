import OpenAI from "openai";

// حط مفتاحك هنا مباشرة مرة ثانية عشان نقطع الشك باليقين
const apiKey = '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'; 

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://openrouter.ai/api/v1", // الرابط محفور هنا حفر
  defaultHeaders: {
    "HTTP-Referer": "https://render.com",
    "X-Title": "Casper Bot",
  }
});

export async function chat(history: any[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct:free", // موديل خفيف ومجاني ومضمون
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        ...history
      ],
    });

    return response.choices[0]?.message?.content || "رد فاضي";
  } catch (error: any) {
    console.error("Error details:", error.response?.data || error.message);
    return `خطأ فني: ${error.message}`;
  }
}
