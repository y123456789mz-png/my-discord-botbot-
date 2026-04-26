// ... نفس الاستيرادات اللي فوق (تأكد من وجود ffmpeg و StreamType) ...

  if (content.startsWith('/speak ')) {
    const channel = message.member?.voice.channel;
    if (channel) {
      const text = content.replace('/speak ', '').trim();
      if (!text) return;

      console.log(`[Audio] Attempting to speak: ${text}`);

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator as any,
        selfDeaf: false,
      });

      // الحصول على رابط الصوت
      const url = googleTTS.getAudioUrl(text, { 
        lang: 'ar', 
        slow: false, 
        host: 'https://translate.google.com' 
      });
      
      const player = createAudioPlayer();

      // التعديل الجوهري: استخدام Arbitrary مع تفاصيل أكثر
      const resource = createAudioResource(url, {
          inputType: StreamType.Arbitrary,
          inlineVolume: true,
      });

      connection.subscribe(player);
      player.play(resource);

      // مراقبة الحالات في الـ Logs عندك
      player.on(AudioPlayerStatus.Playing, () => {
        console.log("[Audio] Player is now PLAYING!");
      });

      player.on('error', error => {
        console.error("[Audio] Player Error:", error.message);
        message.channel.send(`Oops! Audio error: ${error.message}`);
      });

      return;
    }
  }
