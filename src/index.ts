import { Client, GatewayIntentBits } from "discord.js";
import { chat } from "./ai.js";
import dotenv from "dotenv";

dotenv.config();

// هذا السطر هو اللي كان ناقص ويسبب الخطأ
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("messageCreate", async (message) => {
  // يتجاهل البوتات وما يرد إلا لو فيه تاق للبوت
  if (message.author.bot || !message.mentions.has(client.user!)) return;

  try {
    // تنظيف الرسالة من التاق عشان الـ AI يفهم السؤال صح
    const text = message.content.replace(/<@!?\d+>/g, "").trim();
    if (!text) return;

    const response = await chat([{ role: "user", content: text }]);
    await message.reply(response);
  } catch (error) {
    console.error("في مشكلة بالرد:", error);
  }
});

client.once("ready", () => {
  console.log(`✅ ${client.user?.tag} اشتغل الحين وجاهز!`);
});

client.login(process.env.DISCORD_TOKEN);
