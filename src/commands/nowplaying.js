import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { createErrorEmbed, createNowPlayingEmbed } from '../utils/embed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Şu an çalan şarkıyı göster'),

  async execute(interaction) {
    const queue = useQueue(interaction.guildId);

    if (!queue?.currentTrack) {
      return interaction.reply({
        embeds: [createErrorEmbed('Şu an çalan bir şarkı yok!')],
        ephemeral: true,
      });
    }

    const embed = createNowPlayingEmbed(queue.currentTrack, queue);
    return interaction.reply({ embeds: [embed] });
  },
};
