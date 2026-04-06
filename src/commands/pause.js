import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embed.js';
import { EMOJIS } from '../constants/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Şarkıyı duraklar'),

  async execute(interaction) {
    const queue = useQueue(interaction.guildId);

    if (!queue?.isPlaying()) {
      return interaction.reply({
        embeds: [createErrorEmbed('Çalan bir şarkı yok!')],
        ephemeral: true,
      });
    }

    queue.node.pause();

    return interaction.reply({
      embeds: [createSuccessEmbed(`${EMOJIS.PAUSE} Şarkı duraklatıldı.`)],
    });
  },
};
