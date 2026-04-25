client.on("messageCreate", async (message) => {
  // هذا السطر يمنع البوت من الرد على نفسه أو على بوتات ثانية
  if (message.author.bot) return;

  // هذا السطر يضمن إنه ما يرد إلا إذا صار له "تاق"
  if (!message.mentions.has(client.user!)) return;

  try {
    const text = message.content.replace(/<@!?\d+>/g, "").trim();
    if (!text) return;

    const response = await chat([{ role: "user", content: text }]);
    // استخدم message.channel.send أو message.reply "مرة واحدة فقط"
    await message.reply(response);
  } catch (error) {
    console.error(error);
  }
});
