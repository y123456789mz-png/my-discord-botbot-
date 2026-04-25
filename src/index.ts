import { Client, GatewayIntentBits, Partials } from "discord.js";
import { chat } from "./ai.js";
import dotenv from "dotenv";

dotenv.config();

// هنا "المكينة" اللي كانت ناقصة عندك
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.on("messageCreate", async (message) => {
  // يتجاهل البوتات وما يرد إلا لو فيه تاق
  if (message.author.bot || !message.mentions.has(client.user!)) return;

  try {
    const text = message.content.replace(/<@!?\d+>/g, "").trim();
    if (!text) return;

    const response = await chat([{ role: "user", content: text }]);
    await message.reply(response);
  } catch (error) {
    console.error("في خطأ يا بطل:", error);
  }
});

client.once("ready", () => {
  console.log(`✅ ${client.user?.tag} اشتغل الحين وجاهز يسولف!`);
});

// تأكد إنك حاط التوكن في Render
client.login(process.env.DISCORD_TOKEN);
