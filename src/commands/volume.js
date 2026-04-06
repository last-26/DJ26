import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embed.js';
import { EMOJIS } from '../constants/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ses seviyesini ayarla')
    .addIntegerOption((opt) =>
      opt
        .setName('level')
        .setDescription('Ses seviyesi (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const queue = useQueue(interaction.guildId);

    if (!queue?.isPlaying()) {
      return interaction.reply({
        embeds: [createErrorEmbed('Çalan bir şarkı yok!')],
        ephemeral: true,
      });
    }

    const level = interaction.options.getInteger('level');
    queue.node.setVolume(level);

    return interaction.reply({
      embeds: [createSuccessEmbed(`${EMOJIS.VOLUME} Ses seviyesi: **${level}%**`)],
    });
  },
};
