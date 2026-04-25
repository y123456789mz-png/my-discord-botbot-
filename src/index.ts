client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // هذا السطر ضروري عشان البوت ما يرد على نفسه ويدخل في دوامة
  // ... باقي الكود
});
