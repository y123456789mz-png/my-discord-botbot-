import http from 'http';
import { createBot } from "./bot";
import { logger } from "./logger";

// 1. السيرفر الوهمي عشان Render ما يطفي البوت (ضروري للنسخة المجانية)
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.write("Bot is Alive!");
  res.end();
}).listen(PORT, () => {
  logger.info(`Web server is running on port ${PORT}`);
});

// 2. تشغيل البوت
const token = process.env["DISCORD_BOT_TOKEN"];
if (!token) {
  logger.error("DISCORD_BOT_TOKEN environment variable is required");
  process.exit(1);
}

try {
  const sodium = await import("libsodium-wrappers");
  const ready = (sodium.ready ?? sodium.default?.ready) as Promise<void> | undefined;
  if (ready) await ready;
  logger.info("libsodium ready");
} catch (err) {
  logger.warn({ err }, "libsodium-wrappers not available");
}

const client = createBot(token);
