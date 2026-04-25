import { chat } from "./ai.js"; // نعم، نكتب .js حتى لو الملف .ts لأننا نستخدم "type": "module"
import { Client, GatewayIntentBits } from "discord.js";
import { chat } from "./ai.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// تأكد إنك ما حطيت هذا السطر مرتين في الملف
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  try {
    const response = await chat([{ role: "user", content: message.content }]);
    // إرسال الرد مرة واحدة فقط
    await message.reply(response);
  } catch (error) {
    console.error("Error:", error);
  }
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
