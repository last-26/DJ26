import spotifyUrlInfo from 'spotify-url-info';
import { useMainPlayer } from 'discord-player';
import { logger } from '../utils/logger.js';

const { getData, getTracks } = spotifyUrlInfo(fetch);

const SPOTIFY_URL_REGEX = /^https?:\/\/(open\.)?spotify\.com\/(track|playlist|album)\//;
const FILTER_WORDS = ['cover', 'remix', 'live', 'karaoke', 'instrumental'];

/**
 * URL'nin Spotify linki olup olmadığını kontrol eder
 * @param {string} query
 * @returns {boolean}
 */
export function isSpotifyUrl(query) {
  return SPOTIFY_URL_REGEX.test(query);
}

/**
 * Spotify URL türünü belirler
 * @param {string} url
 * @returns {'track'|'playlist'|'album'|null}
 */
export function getSpotifyType(url) {
  const match = url.match(/spotify\.com\/(track|playlist|album)\//);
  return match ? match[1] : null;
}

/**
 * Spotify track metadata'sını çeker
 * @param {string} url - Spotify track URL
 * @returns {Promise<{name: string, artist: string, duration: number}|null>}
 */
export async function getSpotifyTrackInfo(url) {
  try {
    const data = await getData(url);
    return {
      name: data.name,
      artist: data.artists?.map((a) => a.name).join(', ') || 'Unknown',
      duration: data.duration_ms || data.duration || 0,
    };
  } catch (error) {
    logger.error('Spotify track bilgisi alınamadı:', error.message);
    return null;
  }
}

/**
 * Spotify playlist/album'daki tüm track'leri çeker
 * @param {string} url - Spotify playlist veya album URL
 * @returns {Promise<Array<{name: string, artist: string, duration: number}>>}
 */
export async function getSpotifyTracks(url) {
  try {
    const tracks = await getTracks(url);

    return tracks.map((track) => ({
      name: track.name,
      artist: track.artists?.map((a) => a.name).join(', ') || track.artist || 'Unknown',
      duration: track.duration_ms || 0,
    }));
  } catch (error) {
    logger.error('Spotify playlist bilgisi alınamadı:', error.message);
    return [];
  }
}

/**
 * Spotify track'i YouTube'da arar ve en uygun sonucu döner
 * Arama stratejisi: sanatçı + şarkı adı + "official audio" → fallback'ler
 * @param {object} trackInfo - {name, artist, duration}
 * @returns {Promise<string|null>} YouTube arama query'si
 */
export function buildSearchQuery(trackInfo) {
  return `${trackInfo.artist} - ${trackInfo.name}`;
}

/**
 * Spotify URL'yi çözümleyip player üzerinden çalar
 * @param {object} options
 * @param {import('discord-player').Player} options.player
 * @param {string} options.url - Spotify URL
 * @param {import('discord.js').VoiceChannel} options.channel - Ses kanalı
 * @param {object} options.nodeOptions - Player node seçenekleri
 * @param {import('discord.js').TextChannel} options.textChannel - Mesaj kanalı
 * @param {import('discord.js').User} options.requestedBy - İsteyen kullanıcı
 * @returns {Promise<{success: boolean, total: number, added: number, failed: number}>}
 */
export async function resolveSpotify({ player, url, channel, nodeOptions, textChannel, requestedBy }) {
  const type = getSpotifyType(url);

  if (type === 'track') {
    const info = await getSpotifyTrackInfo(url);
    if (!info) return { success: false, total: 1, added: 0, failed: 1 };

    const query = buildSearchQuery(info);
    const result = await player.search(query, { requestedBy });

    if (!result.hasTracks()) {
      return { success: false, total: 1, added: 0, failed: 1 };
    }

    await player.play(channel, result, { nodeOptions });
    return { success: true, total: 1, added: 1, failed: 0 };
  }

  // Playlist veya Album
  const tracks = await getSpotifyTracks(url);
  if (tracks.length === 0) return { success: false, total: 0, added: 0, failed: 0 };

  let added = 0;
  let failed = 0;
  const total = tracks.length;

  for (let i = 0; i < tracks.length; i++) {
    const query = buildSearchQuery(tracks[i]);

    try {
      const result = await player.search(query, { requestedBy });

      if (result.hasTracks()) {
        await player.play(channel, result, { nodeOptions });
        added++;
      } else {
        failed++;
        logger.warn(`Bulunamadı: ${query}`);
      }
    } catch {
      failed++;
      logger.warn(`Hata: ${query}`);
    }

    // Rate limit koruması — her 5 şarkıda progress ve 200ms delay
    if (i > 0 && i % 5 === 0) {
      textChannel.send({
        embeds: [{
          color: 0x5865f2,
          description: `🔄 **${added}/${total}** şarkı eklendi...`,
          footer: { text: 'MuseBot' },
        }],
      });
      await sleep(200);
    }
  }

  return { success: added > 0, total, added, failed };
}

/**
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
