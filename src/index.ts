import { Client, GatewayIntentBits } from "discord.js";
import { chat } from "./ai.js"; 
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("messageCreate", async (message) => {
  // تجاهل رسائل البوتات عشان ما يسوي Loop ويرد على نفسه
  if (message.author.bot) return;

  try {
    const response = await chat([{ role: "user", content: message.content }]);
    await message.reply(response);
  } catch (error) {
    console.error("خطأ في الرد:", error);
  }
});

client.once("ready", () => {
  console.log(`✅ البوت شغال باسم: ${client.user?.tag}`);
});

// تأكد إنك حاط DISCORD_TOKEN في الـ Environment Variables بموقع Render
client.login(process.env.DISCORD_TOKEN);
