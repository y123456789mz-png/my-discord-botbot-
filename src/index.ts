client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // 1. نظام الأوامر السريعة (بدون منشن وبدون ذكاء اصطناعي)
  if (message.content.startsWith('/join')) {
    const channel = message.member?.voice.channel;
    if (channel) {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
      });
      return message.reply("دخلت! 🫡");
    }
    return message.reply("ادخل روم أول يا كاسبر!");
  }

  if (message.content.startsWith('/leave')) {
    const { getVoiceConnection } = await import('@discordjs/voice');
    const connection = getVoiceConnection(message.guildId!);
    if (connection) {
      connection.destroy();
      return message.reply("يلا، أشوفكم على خير! 👋");
    }
    return message.reply("أنا أصلاً مو في الروم!");
  }

  // 2. نظام التحدث (ينطق اللي تكتبه بعد السلاش)
  if (message.content.startsWith('/speak ')) {
    const channel = message.member?.voice.channel;
    if (channel) {
      const text = message.content.replace('/speak ', '').trim();
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
      });
      
      const url = googleTTS.getAudioUrl(text, { lang: 'ar', slow: false, host: 'https://translate.google.com' });
      const player = createAudioPlayer();
      player.play(createAudioResource(url));
      connection.subscribe(player);
      return; // لا ترد بنص، بس تكلم
    }
  }

  // 3. نظام السوالف (فقط إذا منشنته أو في الخاص)
  const isMentioned = message.mentions.has(client.user!);
  const isDM = message.guild === null;

  if (isMentioned || isDM) {
    // كود الذكاء الاصطناعي حقك هنا...
    // (هنا توريال ترد بسوالف)
  }
});
