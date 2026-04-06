import { DefaultExtractors } from '@discord-player/extractor';
import { logger } from '../utils/logger.js';

/**
 * discord-player extractor'larını yükler
 * @param {import('discord-player').Player} player
 */
export async function setupPlayer(player) {
  await player.extractors.loadMulti(DefaultExtractors);
  logger.success('Player extractor\'ları yüklendi.');
}
