export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chat(history: ChatMessage[]): Promise<string> {
  return "أنا شغال يا كاسبر والاتصال واصل للديسكورد، بس مشكلتي مع OpenRouter!";
}

// أضفنا هذي عشان لو index.ts يناديها ما يعطيك Error
export async function voiceChat(wavInput: any, speakerName: string): Promise<any> {
  return { transcript: "", replyText: "", audioWav: Buffer.alloc(0) };
}
