import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { Player } from 'discord-player';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

/**
 * Discord Client oluşturur ve yapılandırır
 * @returns {{ client: Client, player: Player }}
 */
export function createClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
    ],
  });

  client.commands = new Collection();

  const player = new Player(client, {
    ytdlOptions: {
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
    },
  });

  logger.info('Client ve Player oluşturuldu.');

  return { client, player };
}
