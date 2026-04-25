import OpenAI, { toFile } from "openai";

// 1. جلب الإعدادات من المتغيرات أو استخدام قيم افتراضية مضمونة
// جرب تحط المفتاح هنا مباشرة بين العلامتين '' عشان نلغي احتمال ان رندر مو قادره تقرأ المتغير
const apiKey = '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';const baseURL = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"] || "https://openrouter.ai/api/v1";
const CHAT_MODEL = process.env["AI_MODEL"] || "google/gemini-2.0-flash-lite-preview-02-05:free";

if (!apiKey) {
  throw new Error("AI_INTEGRATIONS_OPENAI_API_KEY is missing! Check Render Env Vars.");
}

// 2. إعداد مكتبة OpenAI للعمل مع OpenRouter
const openai = new OpenAI({ 
  baseURL, 
  apiKey,
  defaultHeaders: {
    "HTTP-Referer": "https://render.com", 
    "X-Title": "Casper Discord Bot",
  }
});

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `You are a friendly, helpful AI assistant in a Discord server. 
Keep responses conversational, concise, and match the user's energy. 
Use Markdown for clarity. Respond in the language the user speaks.`;

// 3. وظيفة الشات الأساسية
export async function chat(history: ChatMessage[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: CHAT_MODEL,
      max_tokens: 1024,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
    });

    const reply = response.choices[0]?.message?.content?.trim();
    return reply && reply.length > 0 ? reply : "ما لقيت رد مناسب، جرب تسألني مرة ثانية.";
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return "حصل خطأ في الاتصال بالسيرفر، تأكد من مفتاح الـ API.";
  }
}

// --- وظائف الصوت (إذا كنت تستخدمها) ---
export type VoiceReply = { transcript: string; replyText: string; audioWav: Buffer; };

export async function voiceChat(wavInput: Buffer, speakerName: string): Promise<VoiceReply> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(wavInput, "input.wav", { type: "audio/wav" }),
      model: "openai/whisper-1", // ملاحظة: هذا قد يتطلب رصيد في OpenRouter
    });
    const transcript = (transcription.text ?? "").trim();
    if (!transcript) return { transcript: "", replyText: "", audioWav: Buffer.alloc(0) };

    const replyText = await chat([{ role: "user", content: `${speakerName} said: "${transcript}"` }]);
    return { transcript, replyText, audioWav: Buffer.alloc(0) }; // الصوت يحتاج إعدادات إضافية
  } catch (error) {
    return { transcript: "Error", replyText: "Sorry, voice error.", audioWav: Buffer.alloc(0) };
  }
}
