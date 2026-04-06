import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Şu an çalan şarkıyı atla'),

  async execute(interaction) {
    const queue = useQueue(interaction.guildId);

    if (!queue?.isPlaying()) {
      return interaction.reply({
        embeds: [createErrorEmbed('Çalan bir şarkı yok!')],
        ephemeral: true,
      });
    }

    const currentTrack = queue.currentTrack;
    queue.node.skip();

    return interaction.reply({
      embeds: [createSuccessEmbed(`**${currentTrack.title}** atlandı!`)],
    });
  },
};
