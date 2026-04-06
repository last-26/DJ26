import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embed.js';
import { EMOJIS } from '../constants/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Müziği durdur ve kanaldan ayrıl'),

  async execute(interaction) {
    const queue = useQueue(interaction.guildId);

    if (!queue) {
      return interaction.reply({
        embeds: [createErrorEmbed('Çalan bir şarkı yok!')],
        ephemeral: true,
      });
    }

    queue.delete();

    return interaction.reply({
      embeds: [createSuccessEmbed(`${EMOJIS.STOP} Müzik durduruldu ve kanaldan ayrıldım.`)],
    });
  },
};
