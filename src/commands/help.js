import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COLORS } from '../config.js';
import { EMOJIS } from '../constants/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Tüm komutların listesini göster'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(`${EMOJIS.MUSIC} MuseBot — Komutlar`)
      .setDescription('YouTube ve Spotify destekli müzik botu!')
      .addFields(
        {
          name: `${EMOJIS.PLAY} Müzik Çalma`,
          value: [
            '`/play <query>` — Şarkı adı, YouTube veya Spotify URL ile çal',
            '`/pause` — Şarkıyı duraklat',
            '`/resume` — Duraklatılmış şarkıyı devam ettir',
            '`/stop` — Müziği durdur ve kanaldan ayrıl',
            '`/skip` — Şarkıyı atla',
            '`/seek <seconds>` — Şarkıda ileri/geri sar',
          ].join('\n'),
        },
        {
          name: `${EMOJIS.QUEUE} Kuyruk Yönetimi`,
          value: [
            '`/queue` — Kuyruk listesini göster',
            '`/shuffle` — Kuyruğu karıştır',
            '`/loop <mode>` — Tekrar modu (off/track/queue)',
            '`/remove <position>` — Kuyruktan şarkı kaldır',
            '`/clear` — Kuyruğu temizle',
          ].join('\n'),
        },
        {
          name: `${EMOJIS.STAR} Diğer`,
          value: [
            '`/nowplaying` — Şu an çalan şarkıyı göster',
            '`/volume <1-100>` — Ses seviyesini ayarla',
            '`/lyrics` — Şarkı sözlerini göster',
            '`/help` — Bu mesajı göster',
          ].join('\n'),
        },
        {
          name: '🔗 Desteklenen Linkler',
          value: [
            '• YouTube video/playlist URL',
            '• Spotify track/playlist/album URL',
            '• Şarkı adı ile arama',
          ].join('\n'),
        }
      )
      .setFooter({ text: 'MuseBot • /help' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
