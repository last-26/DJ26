import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../config.js';
import { EMOJIS } from '../constants/emojis.js';

/**
 * Şarkı embed'i oluşturur
 * @param {object} track - discord-player Track objesi
 * @param {string} requestedBy - İsteyen kullanıcı
 * @returns {EmbedBuilder}
 */
export function createTrackEmbed(track, requestedBy) {
  return new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle(`${EMOJIS.MUSIC} Now Playing`)
    .setDescription(`**[${track.title}](${track.url})**`)
    .addFields(
      { name: 'Sanatçı', value: track.author || 'Bilinmiyor', inline: true },
      { name: 'Süre', value: track.duration || 'Canlı', inline: true },
      { name: 'İsteyen', value: requestedBy, inline: true }
    )
    .setThumbnail(track.thumbnail)
    .setFooter({ text: 'MuseBot' })
    .setTimestamp();
}

/**
 * Kuyruğa eklendi embed'i
 * @param {object} track - discord-player Track objesi
 * @param {number} position - Kuyruktaki pozisyon
 * @returns {EmbedBuilder}
 */
export function createAddedToQueueEmbed(track, position) {
  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setDescription(`${EMOJIS.ADD} **[${track.title}](${track.url})** kuyruğa eklendi — Sıra: **#${position}**`)
    .setFooter({ text: 'MuseBot' })
    .setTimestamp();
}

/**
 * Kuyruk embed'i oluşturur (sayfalı)
 * @param {object} queue - discord-player Queue objesi
 * @param {number} page - Sayfa numarası
 * @returns {EmbedBuilder}
 */
export function createQueueEmbed(queue, page = 0) {
  const tracks = queue.tracks.toArray();
  const pageSize = 10;
  const pages = Math.ceil(tracks.length / pageSize) || 1;
  const start = page * pageSize;
  const end = start + pageSize;
  const currentTracks = tracks.slice(start, end);

  const currentTrack = queue.currentTrack;

  let description = '';
  if (currentTrack) {
    description += `${EMOJIS.PLAY} **Şu an çalan:** [${currentTrack.title}](${currentTrack.url}) — \`${currentTrack.duration}\`\n\n`;
  }

  if (currentTracks.length === 0) {
    description += 'Kuyrukta başka şarkı yok.';
  } else {
    description += currentTracks
      .map((track, i) => `**${start + i + 1}.** [${track.title}](${track.url}) — \`${track.duration}\` | ${track.requestedBy}`)
      .join('\n');
  }

  const totalDuration = tracks.reduce((acc, t) => acc + (t.durationMS || 0), 0);
  const totalFormatted = formatMs(totalDuration);

  return new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle(`${EMOJIS.QUEUE} Kuyruk`)
    .setDescription(description)
    .setFooter({ text: `Sayfa ${page + 1}/${pages} • ${tracks.length} şarkı • Toplam: ${totalFormatted} • MuseBot` })
    .setTimestamp();
}

/**
 * Hata embed'i
 * @param {string} message - Hata mesajı
 * @returns {EmbedBuilder}
 */
export function createErrorEmbed(message) {
  return new EmbedBuilder()
    .setColor(COLORS.ERROR)
    .setDescription(`${EMOJIS.ERROR} ${message}`)
    .setFooter({ text: 'MuseBot' })
    .setTimestamp();
}

/**
 * Başarı embed'i
 * @param {string} message - Başarı mesajı
 * @returns {EmbedBuilder}
 */
export function createSuccessEmbed(message) {
  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setDescription(`${EMOJIS.ADD} ${message}`)
    .setFooter({ text: 'MuseBot' })
    .setTimestamp();
}

/**
 * Now playing embed'i (detaylı)
 * @param {object} track - Şu an çalan track
 * @param {object} queue - Queue objesi
 * @returns {EmbedBuilder}
 */
export function createNowPlayingEmbed(track, queue) {
  const progress = queue.node.createProgressBar();
  const timestamp = queue.node.getTimestamp();

  return new EmbedBuilder()
    .setColor(COLORS.PRIMARY)
    .setTitle(`${EMOJIS.MUSIC} Now Playing`)
    .setDescription(`**[${track.title}](${track.url})**`)
    .addFields(
      { name: 'Sanatçı', value: track.author || 'Bilinmiyor', inline: true },
      { name: 'Süre', value: `${timestamp?.current?.label ?? '0:00'} / ${timestamp?.total?.label ?? track.duration}`, inline: true },
      { name: 'İsteyen', value: `${track.requestedBy}`, inline: true },
      { name: 'İlerleme', value: progress || '▶ advancement' }
    )
    .setThumbnail(track.thumbnail)
    .setFooter({ text: 'MuseBot' })
    .setTimestamp();
}

/**
 * Milisaniyeyi okunabilir formata çevirir
 * @param {number} ms
 * @returns {string}
 */
function formatMs(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
