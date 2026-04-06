import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Kuyruktan bir şarkıyı kaldır')
    .addIntegerOption((opt) =>
      opt
        .setName('position')
        .setDescription('Kuyruktaki sıra numarası')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const queue = useQueue(interaction.guildId);

    if (!queue || queue.tracks.size === 0) {
      return interaction.reply({
        embeds: [createErrorEmbed('Kuyrukta şarkı yok!')],
        ephemeral: true,
      });
    }

    const position = interaction.options.getInteger('position');
    const tracks = queue.tracks.toArray();

    if (position > tracks.length) {
      return interaction.reply({
        embeds: [createErrorEmbed(`Kuyrukta sadece **${tracks.length}** şarkı var!`)],
        ephemeral: true,
      });
    }

    const removed = queue.tracks.toArray()[position - 1];
    queue.removeTrack(position - 1);

    return interaction.reply({
      embeds: [createSuccessEmbed(`**${removed.title}** kuyruktan kaldırıldı.`)],
    });
  },
};
