import { logger } from '../utils/logger.js';
import { createErrorEmbed } from '../utils/embed.js';

/**
 * Bot event'lerini kaydet
 * @param {import('discord.js').Client} client
 */
export function registerBotEvents(client) {
  client.once('ready', () => {
    logger.success(`${client.user.tag} olarak giriş yapıldı!`);
    logger.info(`${client.guilds.cache.size} sunucuda aktif.`);
    client.user.setActivity('🎵 /play ile müzik çal', { type: 2 });
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Komut hatası [${interaction.commandName}]:`, error);

      const errorEmbed = createErrorEmbed('Komutu çalıştırırken bir hata oluştu!');
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  });
}
