import { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus 
} from '@discordjs/voice';
import gTTS from 'gtts';
import { createWriteStream } from 'fs';
import { join } from 'path';

// دالة لجعل البوت يتحدث في القناة الصوتية
async function speakInVoice(channel: any, text: string) {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const gtts = new gTTS(text, 'ar'); // اللغة العربية
    const filePath = join(process.cwd(), 'response.mp3');
    
    // حفظ النص كملف صوتي مؤقت
    gtts.save(filePath, (err: any) => {
        if (err) return console.error("Error saving gTTS:", err);

        const player = createAudioPlayer();
        const resource = createAudioResource(filePath);

        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
            // اختيارياً: اترك القناة بعد الانتهاء
            // connection.destroy();
        });
    });
}

// داخل الـ client.on('messageCreate')
// أضف شرطاً: إذا كان المستخدم في قناة صوتية، اجعل البوت ينضم ويتحدث
if (message.member?.voice.channel) {
    const responseText = await chat(prompt); // رد غروق اللي سويناه قبل
    await message.reply(responseText); // رد نصي
    await speakInVoice(message.member.voice.channel, responseText); // رد صوتي
}
