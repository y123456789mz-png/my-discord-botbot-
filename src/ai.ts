import axios from "axios";

export async function chat(history: any[]): Promise<string> {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;

  if (!accountId || !apiToken) {
    return "يا كاسبر، تأكد من إضافة CF_ACCOUNT_ID و CF_API_TOKEN في رندر!";
  }

  try {
    // تم تصحيح الرابط هنا ليكون متوافق مع نسخة Llama 3 المستقرة
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
        headers: { 
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    // كلاود فلير أحياناً يرجع النتيجة في result.response
    return response.data.result.response || "سم؟ وش بغيت؟";
  } catch (err: any) {
    // هنا بيطبع لك الخطأ بالتفصيل في الـ Logs عشان نعرف وش السالفة لو خرب
    console.error("Cloudflare Detailed Error:", err.response?.data || err.message);
    return `يا كاسبر فيه بلا في السيرفر: ${err.message}`;
  }
}
