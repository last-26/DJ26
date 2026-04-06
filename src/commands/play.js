import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';
import { createErrorEmbed } from '../utils/embed.js';
import { config } from '../config.js';
import { EMOJIS } from '../constants/emojis.js';
import { logger } from '../utils/logger.js';
import { isSpotifyUrl, resolveSpotify } from '../player/resolvers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Şarkı çal veya kuyruğa ekle')
    .addStringOption((opt) =>
      opt
        .setName('query')
        .setDescription('Şarkı adı, YouTube URL veya Spotify URL')
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.member.voice.channel;
    if (!channel) {
      return interaction.reply({
        embeds: [createErrorEmbed('Önce bir ses kanalına katılmalısın!')],
        ephemeral: true,
      });
    }

    // Bot başka bir kanalda mı kontrol et
    const botVoice = interaction.guild.members.me.voice.channel;
    if (botVoice && botVoice.id !== channel.id) {
      return interaction.reply({
        embeds: [createErrorEmbed('Botla aynı ses kanalında olmalısın!')],
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const query = interaction.options.getString('query');
    const player = useMainPlayer();

    const nodeOptions = {
      metadata: {
        channel: interaction.channel,
        requestedBy: interaction.user,
      },
      volume: config.defaultVolume,
      leaveOnEmpty: true,
      leaveOnEmptyCooldown: config.inactivityTimeout,
      leaveOnEnd: true,
      leaveOnEndCooldown: config.inactivityTimeout,
    };

    try {
      // Spotify URL kontrolü
      if (isSpotifyUrl(query)) {
        const result = await resolveSpotify({
          player,
          url: query,
          channel,
          nodeOptions,
          textChannel: interaction.channel,
          requestedBy: interaction.user,
        });

        if (!result.success) {
          return interaction.followUp({
            embeds: [createErrorEmbed('Spotify şarkısı YouTube\'da bulunamadı!')],
          });
        }

        if (result.total > 1) {
          return interaction.followUp({
            embeds: [{
              color: 0x1db954,
              description: `${EMOJIS.ADD} Spotify playlist: **${result.added}/${result.total}** şarkı eklendi.${result.failed > 0 ? `\n${EMOJIS.WARNING} ${result.failed} şarkı bulunamadı.` : ''}`,
              footer: { text: 'MuseBot' },
              timestamp: new Date().toISOString(),
            }],
          });
        }

        return interaction.followUp({
          embeds: [{
            color: 0x1db954,
            description: `${EMOJIS.MUSIC} Spotify şarkısı çalınıyor...`,
            footer: { text: 'MuseBot' },
            timestamp: new Date().toISOString(),
          }],
        });
      }

      // YouTube URL veya arama
      const result = await player.search(query, {
        requestedBy: interaction.user,
      });

      if (!result.hasTracks()) {
        return interaction.followUp({
          embeds: [createErrorEmbed(`${EMOJIS.SEARCH} Sonuç bulunamadı: **${query}**`)],
        });
      }

      const { track } = await player.play(channel, result, { nodeOptions });

      const isPlaylist = result.playlist;
      if (isPlaylist) {
        return interaction.followUp({
          embeds: [{
            color: 0x57f287,
            description: `${EMOJIS.ADD} **${result.tracks.length}** şarkılık playlist kuyruğa eklendi!\n${EMOJIS.MUSIC} **${result.playlist.title}**`,
            thumbnail: { url: result.playlist.thumbnail },
            footer: { text: 'MuseBot' },
            timestamp: new Date().toISOString(),
          }],
        });
      }

      return interaction.followUp({
        embeds: [{
          color: 0x1db954,
          description: `${EMOJIS.SEARCH} **[${track.title}](${track.url})** aranıyor ve çalınıyor...`,
          footer: { text: 'MuseBot' },
          timestamp: new Date().toISOString(),
        }],
      });
    } catch (error) {
      logger.error('Play hatası:', error);
      return interaction.followUp({
        embeds: [createErrorEmbed(`Şarkı çalınırken hata oluştu: ${error.message}`)],
      });
    }
  },
};
