import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Kuyruğu temizle'),

  async execute(interaction) {
    const queue = useQueue(interaction.guildId);

    if (!queue || queue.tracks.size === 0) {
      return interaction.reply({
        embeds: [createErrorEmbed('Kuyrukta temizlenecek şarkı yok!')],
        ephemeral: true,
      });
    }

    const count = queue.tracks.size;
    queue.tracks.clear();

    return interaction.reply({
      embeds: [createSuccessEmbed(`**${count}** şarkı kuyruktan temizlendi.`)],
    });
  },
};
