import { SlashCommandBuilder } from 'discord.js';
import { useQueue, QueueRepeatMode } from 'discord-player';
import { createErrorEmbed, createSuccessEmbed } from '../utils/embed.js';
import { EMOJIS } from '../constants/emojis.js';

const modeMap = {
  off: QueueRepeatMode.OFF,
  track: QueueRepeatMode.TRACK,
  queue: QueueRepeatMode.QUEUE,
};

const modeLabels = {
  off: 'Kapalı',
  track: `${EMOJIS.LOOP_TRACK} Şarkı Tekrarı`,
  queue: `${EMOJIS.LOOP} Kuyruk Tekrarı`,
};

export default {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Tekrar modunu ayarla')
    .addStringOption((opt) =>
      opt
        .setName('mode')
        .setDescription('Tekrar modu')
        .setRequired(true)
        .addChoices(
          { name: 'Kapalı', value: 'off' },
          { name: 'Şarkı Tekrarı', value: 'track' },
          { name: 'Kuyruk Tekrarı', value: 'queue' }
        )
    ),

  async execute(interaction) {
    const queue = useQueue(interaction.guildId);

    if (!queue?.isPlaying()) {
      return interaction.reply({
        embeds: [createErrorEmbed('Çalan bir şarkı yok!')],
        ephemeral: true,
      });
    }

    const mode = interaction.options.getString('mode');
    queue.setRepeatMode(modeMap[mode]);

    return interaction.reply({
      embeds: [createSuccessEmbed(`Tekrar modu: **${modeLabels[mode]}**`)],
    });
  },
};
