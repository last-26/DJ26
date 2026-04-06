import { SlashCommandBuilder } from 'discord.js';
import { useQueue } from 'discord-player';
import { Genius } from 'genius-lyrics';
import { createErrorEmbed } from '../utils/embed.js';
import { COLORS } from '../config.js';
import { EMOJIS } from '../constants/emojis.js';
import { logger } from '../utils/logger.js';

const genius = new Genius();

export default {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Şu an çalan şarkının sözlerini göster'),

  async execute(interaction) {
    const queue = useQueue(interaction.guildId);

    if (!queue?.currentTrack) {
      return interaction.reply({
        embeds: [createErrorEmbed('Şu an çalan bir şarkı yok!')],
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const track = queue.currentTrack;
    const searchQuery = `${track.author} ${track.title}`
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    try {
      const searches = await genius.songs.search(searchQuery);
      const song = searches[0];

      if (!song) {
        return interaction.followUp({
          embeds: [createErrorEmbed(`${EMOJIS.LYRICS} Şarkı sözleri bulunamadı: **${track.title}**`)],
        });
      }

      const lyrics = await song.lyrics();

      if (!lyrics) {
        return interaction.followUp({
          embeds: [createErrorEmbed(`${EMOJIS.LYRICS} Şarkı sözleri bulunamadı: **${track.title}**`)],
        });
      }

      // Discord embed 4096 karakter limiti — sayfalara böl
      const chunks = splitLyrics(lyrics, 4000);

      for (let i = 0; i < chunks.length; i++) {
        const embed = {
          color: COLORS.PRIMARY,
          title: i === 0 ? `${EMOJIS.LYRICS} ${song.title} — ${song.artist.name}` : undefined,
          description: chunks[i],
          footer: {
            text: chunks.length > 1 ? `Sayfa ${i + 1}/${chunks.length} • MuseBot` : 'MuseBot',
          },
          timestamp: new Date().toISOString(),
        };

        if (i === 0) {
          await interaction.followUp({ embeds: [embed] });
        } else {
          await interaction.channel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      logger.error('Lyrics hatası:', error);
      return interaction.followUp({
        embeds: [createErrorEmbed('Şarkı sözleri alınırken bir hata oluştu.')],
      });
    }
  },
};

/**
 * Uzun metni belirli karakter limitinde parçalara böler
 * @param {string} text
 * @param {number} maxLength
 * @returns {string[]}
 */
function splitLyrics(text, maxLength) {
  const chunks = [];
  let current = '';

  for (const line of text.split('\n')) {
    if ((current + '\n' + line).length > maxLength) {
      chunks.push(current);
      current = line;
    } else {
      current = current ? current + '\n' + line : line;
    }
  }
  if (current) chunks.push(current);

  return chunks;
}
