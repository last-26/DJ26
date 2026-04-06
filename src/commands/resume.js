import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embed.js';
import { EMOJIS } from '../constants/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Duraklatılmış şarkıyı devam ettirir'),

  async execute(interaction) {
    const queue = useQueue(interaction.guildId);

    if (!queue) {
      return interaction.reply({
        embeds: [createErrorEmbed('Çalan bir şarkı yok!')],
        ephemeral: true,
      });
    }

    queue.node.resume();

    return interaction.reply({
      embeds: [createSuccessEmbed(`${EMOJIS.PLAY} Şarkı devam ediyor.`)],
    });
  },
};
