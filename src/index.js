import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from './bot/client.js';
import { registerBotEvents } from './bot/events.js';
import { setupPlayer } from './player/setup.js';
import { registerPlayerEvents } from './player/events.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Client ve Player oluştur
const { client, player } = createClient();

// Player extractor'larını yükle
await setupPlayer(player);

// Player event'lerini kaydet
registerPlayerEvents(player);

// Komutları yükle
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
  logger.info(`Komut yüklendi: /${command.default.data.name}`);
}

// Bot event'lerini kaydet
registerBotEvents(client);

// Giriş yap
client.login(config.token);
