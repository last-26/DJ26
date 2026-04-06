import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { useQueue } from 'discord-player';
import { createErrorEmbed, createQueueEmbed } from '../utils/embed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Kuyruk listesini göster'),

  async execute(interaction) {
    const queue = useQueue(interaction.guildId);

    if (!queue || !queue.currentTrack) {
      return interaction.reply({
        embeds: [createErrorEmbed('Kuyrukta şarkı yok!')],
        ephemeral: true,
      });
    }

    let page = 0;
    const tracks = queue.tracks.toArray();
    const totalPages = Math.ceil(tracks.length / 10) || 1;

    const embed = createQueueEmbed(queue, page);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('queue_prev')
        .setLabel('⬅️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('queue_next')
        .setLabel('➡️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(totalPages <= 1)
    );

    const response = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const collector = response.createMessageComponentCollector({ time: 120_000 });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'Bu butonları sadece komutu kullanan kişi kullanabilir!', ephemeral: true });
      }

      if (i.customId === 'queue_prev') page--;
      if (i.customId === 'queue_next') page++;

      const newEmbed = createQueueEmbed(queue, page);
      const newRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('queue_prev')
          .setLabel('⬅️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('queue_next')
          .setLabel('➡️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= totalPages - 1)
      );

      await i.update({ embeds: [newEmbed], components: [newRow] });
    });

    collector.on('end', () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('queue_prev').setLabel('⬅️').setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder().setCustomId('queue_next').setLabel('➡️').setStyle(ButtonStyle.Secondary).setDisabled(true)
      );
      response.edit({ components: [disabledRow] }).catch(() => {});
    });
  },
};
