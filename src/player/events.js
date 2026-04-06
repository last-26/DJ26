import { EMOJIS } from '../constants/emojis.js';
import { createTrackEmbed, createErrorEmbed } from '../utils/embed.js';
import { logger } from '../utils/logger.js';
import { config } from '../config.js';

/**
 * Player event'lerini dinler
 * @param {import('discord-player').Player} player
 */
export function registerPlayerEvents(player) {
  player.events.on('playerStart', (queue, track) => {
    const embed = createTrackEmbed(track, track.requestedBy);
    queue.metadata.channel.send({ embeds: [embed] });
    logger.info(`Çalıyor: ${track.title} — ${track.author}`);
  });

  player.events.on('audioTrackAdd', (queue, track) => {
    // İlk şarkıysa (direkt çalınacak) bildirim gösterme
    if (queue.tracks.size === 0) return;
    queue.metadata.channel.send({
      embeds: [{
        color: 0x57f287,
        description: `${EMOJIS.ADD} **[${track.title}](${track.url})** kuyruğa eklendi — Sıra: **#${queue.tracks.size}**`,
        footer: { text: 'MuseBot' },
        timestamp: new Date().toISOString(),
      }],
    });
  });

  player.events.on('audioTracksAdd', (queue, tracks) => {
    queue.metadata.channel.send({
      embeds: [{
        color: 0x57f287,
        description: `${EMOJIS.ADD} **${tracks.length}** şarkı kuyruğa eklendi!`,
        footer: { text: 'MuseBot' },
        timestamp: new Date().toISOString(),
      }],
    });
  });

  player.events.on('playerSkip', (queue, track) => {
    queue.metadata.channel.send({
      embeds: [{
        color: 0xffaa00,
        description: `${EMOJIS.SKIP} **${track.title}** atlandı — oynatılamadı.`,
        footer: { text: 'MuseBot' },
        timestamp: new Date().toISOString(),
      }],
    });
    logger.warn(`Track atlandı: ${track.title}`);
  });

  player.events.on('emptyQueue', (queue) => {
    queue.metadata.channel.send({
      embeds: [{
        color: 0x5865f2,
        description: `${EMOJIS.EMPTY} Kuyruk bitti!`,
        footer: { text: 'MuseBot' },
        timestamp: new Date().toISOString(),
      }],
    });
    logger.info('Kuyruk bitti.');
  });

  player.events.on('emptyChannel', (queue) => {
    queue.metadata.channel.send({
      embeds: [{
        color: 0xffaa00,
        description: `${EMOJIS.WAVE} Ses kanalı boş, ayrılıyorum.`,
        footer: { text: 'MuseBot' },
        timestamp: new Date().toISOString(),
      }],
    });
    logger.info('Ses kanalı boş — ayrıldı.');
  });

  player.events.on('playerError', (queue, error) => {
    queue.metadata.channel.send({
      embeds: [createErrorEmbed(`Oynatma hatası: ${error.message}`)],
    });
    logger.error('Player hatası:', error.message);
  });

  player.events.on('error', (queue, error) => {
    queue.metadata.channel.send({
      embeds: [createErrorEmbed(`Genel hata: ${error.message}`)],
    });
    logger.error('Genel hata:', error.message);
  });
}
