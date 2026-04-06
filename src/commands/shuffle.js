import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embed.js';
import { EMOJIS } from '../constants/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Kuyruğu karıştır'),

  async execute(interaction) {
    const queue = useQueue(interaction.guildId);

    if (!queue || queue.tracks.size < 2) {
      return interaction.reply({
        embeds: [createErrorEmbed('Karıştırmak için kuyrukta en az 2 şarkı olmalı!')],
        ephemeral: true,
      });
    }

    queue.tracks.shuffle();

    return interaction.reply({
      embeds: [createSuccessEmbed(`${EMOJIS.SHUFFLE} Kuyruk karıştırıldı!`)],
    });
  },
};
