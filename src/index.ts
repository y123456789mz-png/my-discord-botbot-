// ... (الأكواد اللي فوق في ملفك خلها مثل ما هي لين توصل عند أمر /speak) ...

  if (content.startsWith('/speak ')) {
    const channel = message.member?.voice.channel;
    if (channel) {
      const text = content.replace('/speak ', '').trim();
      if (!text) return;

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
        selfDeaf: false,
      });

      const url = googleTTS.getAudioUrl(text, { 
        lang: 'ar', 
        slow: false, 
        host: 'https://translate.google.com' 
      });

      const player = createAudioPlayer();
      // هنا استخدمنا StreamType.OggOpus أو نتركها تلقائية
      const resource = createAudioResource(url);

      player.play(resource);
      connection.subscribe(player);

      player.on('error', error => {
        console.error("Audio Error:", error);
      });
      
      return;
    }
  }
// ... (باقي الملف مثل ما هو) ...
