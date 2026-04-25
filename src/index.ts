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
  if (message.author.bot || !message.mentions.has(client.user!)) return;

  try {
    const text = message.content.replace(/<@!?\d+>/g, "").trim();
    if (!text) return;

    const response = await chat([{ role: "user", content: text }]);
    await message.reply(response);
  } catch (error) {
    console.error("Error:", error);
  }
});

client.once("ready", () => console.log(`✅ ${client.user?.tag} is online!`));

client.login(process.env.DISCORD_TOKEN);
