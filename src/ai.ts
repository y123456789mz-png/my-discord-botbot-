import axios from "axios";

export async function chat(history: any[]): Promise<string> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;

  if (!accountId || !apiToken) {
    return "يا كاسبر، تأكد من إضافة CF_ACCOUNT_ID و CF_API_TOKEN في رندر!";
  }

  try {
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3-8b-instruct`,
      {
        messages: [
          { 
            role: "system", 
            content: "أنت مساعد ذكي بلمحة من روح توريال. لهجتك سعودية سنعة ومزيج مع إنجليزي. آرثر مورغان هو أسطورة ريد ديد وليس لاعب كرة قدم! خاطب العيال دائماً بصيغة المذكر. خلك واقعي وابتعد عن الكرنج." 
          },
          ...history.map(h => ({ 
            role: h.role === "assistant" ? "assistant" : "user", 
            content: h.content 
          }))
        ]
      },
      {
        headers: { Authorization: `Bearer ${apiToken}` }
      }
    );

    return response.data.result.response || "سم؟ وش بغيت؟";
  } catch (err: any) {
    console.error("Cloudflare Error:", err.response?.data || err.message);
    return `يا كاسبر فيه مشكلة في السيرفر: ${err.message}`;
  }
}
