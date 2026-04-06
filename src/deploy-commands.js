import { REST, Routes } from 'discord.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  commands.push(command.default.data.toJSON());
  logger.info(`Komut yüklendi: /${command.default.data.name}`);
}

const rest = new REST({ version: '10' }).setToken(config.token);

try {
  logger.info(`${commands.length} slash komut kaydediliyor...`);

  if (config.guildId) {
    // Guild-specific (anında aktif)
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands }
    );
    logger.success(`${commands.length} komut sunucuya kaydedildi (guild: ${config.guildId}).`);
  } else {
    // Global (1 saate kadar sürebilir)
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );
    logger.success(`${commands.length} komut global olarak kaydedildi.`);
  }
} catch (error) {
  logger.error('Komut kaydı hatası:', error);
}
