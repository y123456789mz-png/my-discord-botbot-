import OpenAI, { toFile } from "openai";

const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
const baseURL =
  process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"] ?? "https://api.openai.com/v1";

if (!apiKey) {
  throw new Error("AI_INTEGRATIONS_OPENAI_API_KEY must be set");
}

// Model configuration via env vars — easy to swap providers (OpenAI, OpenRouter, etc.)
const CHAT_MODEL = process.env["AI_MODEL"] ?? "gpt-3.5-turbo";
const STT_MODEL = process.env["AI_STT_MODEL"] ?? "whisper-1";
const TTS_MODEL = process.env["AI_TTS_MODEL"] ?? "tts-1";
const TTS_VOICE = process.env["AI_TTS_VOICE"] ?? "alloy";

const openai = new OpenAI({ baseURL, apiKey });

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `You are a friendly, helpful AI assistant chatting inside a Discord server.
Keep responses conversational and concise — Discord messages are best when short and readable.
Use simple Markdown when it helps (bold, lists, code blocks). Avoid extremely long replies.
If you're unsure, say so honestly. Do not invent facts.`;

export async function chat(history: ChatMessage[]): Promise<string> {
  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    max_tokens: 1024,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
  });

  const reply = response.choices[0]?.message?.content?.trim();
  return reply && reply.length > 0
    ? reply
    : "Sorry, I couldn't think of a reply for that.";
}

export type VoiceReply = {
  transcript: string;
  replyText: string;
  audioWav: Buffer;
};

const VOICE_SYSTEM_PROMPT = `You are a friendly AI participant in a Discord voice call.
Reply naturally and briefly — like you're chatting with friends. Keep responses short (1-3 sentences).
Match the language the speaker is using.`;

export async function voiceChat(
  wavInput: Buffer,
  speakerName: string,
): Promise<VoiceReply> {
  // 1) Speech-to-text — transcribe what the user said.
  const transcription = await openai.audio.transcriptions.create({
    file: await toFile(wavInput, "input.wav", { type: "audio/wav" }),
    model: STT_MODEL,
    response_format: "json",
  });
  const transcript = (transcription.text ?? "").trim();

  if (!transcript) {
    return { transcript: "", replyText: "", audioWav: Buffer.alloc(0) };
  }

  // 2) Generate a chat reply with the configured chat model.
  const chatResp = await openai.chat.completions.create({
    model: CHAT_MODEL,
    max_tokens: 256,
    messages: [
      { role: "system", content: VOICE_SYSTEM_PROMPT },
      { role: "user", content: `${speakerName} said: "${transcript}"` },
    ],
  });
  const replyText =
    chatResp.choices[0]?.message?.content?.trim() ?? "Sorry, I missed that.";

  // 3) Text-to-speech — speak the reply.
  const speech = await openai.audio.speech.create({
    model: TTS_MODEL,
    voice: TTS_VOICE as "alloy",
    input: replyText,
    response_format: "wav",
  });
  const audioWav = Buffer.from(await speech.arrayBuffer());

  return { transcript, replyText, audioWav };
}
