import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embed.js';
import { EMOJIS } from '../constants/emojis.js';

export default {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Şarkıda ileri veya geri sar')
    .addIntegerOption((opt) =>
      opt
        .setName('seconds')
        .setDescription('Saniye cinsinden pozisyon')
        .setRequired(true)
        .setMinValue(0)
    ),

  async execute(interaction) {
    const queue = useQueue(interaction.guildId);

    if (!queue?.isPlaying()) {
      return interaction.reply({
        embeds: [createErrorEmbed('Çalan bir şarkı yok!')],
        ephemeral: true,
      });
    }

    const seconds = interaction.options.getInteger('seconds');
    const ms = seconds * 1000;

    if (ms > queue.currentTrack.durationMS) {
      return interaction.reply({
        embeds: [createErrorEmbed('Belirtilen süre şarkının uzunluğunu aşıyor!')],
        ephemeral: true,
      });
    }

    await queue.node.seek(ms);

    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    const formatted = `${min}:${sec.toString().padStart(2, '0')}`;

    return interaction.reply({
      embeds: [createSuccessEmbed(`${EMOJIS.CLOCK} Şarkı **${formatted}** konumuna sarıldı.`)],
    });
  },
};
