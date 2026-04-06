import 'dotenv/config';

export const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  defaultVolume: parseInt(process.env.DEFAULT_VOLUME) || 50,
  inactivityTimeout: parseInt(process.env.INACTIVITY_TIMEOUT) || 300000,
};

export const COLORS = {
  PRIMARY: 0x1db954,
  ERROR: 0xff4444,
  WARNING: 0xffaa00,
  INFO: 0x5865f2,
  SUCCESS: 0x57f287,
};
