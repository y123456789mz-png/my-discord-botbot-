import { Client, GatewayIntentBits } from "discord.js";
import { chat } from "./ai.js";
import dotenv from "dotenv";
import http from "http";

dotenv.config();

// --- خدعة Render للمحافظة على تشغيل البوت مجاناً ---
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running!");
}).listen(port, () => {
  console.log(`Listening on port ${port} to keep Render happy.`);
});
// -----------------------------------------------

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("messageCreate", async (message) => {
  // يتجاهل رسايل البوتات، وما يرد إلا لو سويت له تاق (Mention)
  if (message.author.bot || !message.mentions.has(client.user!)) return;

  try {
    // تنظيف الرسالة من التاق عشان الذكاء الاصطناعي يركز في السؤال
    const text = message.content.replace(/<@!?\d+>/g, "").trim();
    if (!text) return;

    // إرسال المحادثة لملف ai.ts وتلقي الرد
    const response = await chat([{ role: "user", content: text }]);
    await message.reply(response);
  } catch (error) {
    console.error("Error in messageCreate:", error);
  }
});

client.once("ready", () => {
  console.log(`✅ ${client.user?.tag} is online and ready!`);
});

// تأكد إنك ضايف DISCORD_TOKEN في الـ Environment Variables بموقع Render
client.login(process.env.DISCORD_TOKEN);
