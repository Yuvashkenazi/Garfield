import { Collection, GatewayIntentBits } from 'discord.js';
import { CustomClient } from './extensions/CustomClient.js';
import process from 'process';
import { read, getFilePath } from './repository/FileRepo.js';
import { FileBasePaths } from './constants/FileBasepaths.js';
import { isDevEnv } from './utils/Common.js';
import { logger } from './utils/LoggingHelper.js';

export interface Config {
  clientId: string;
  guildId: string;
  token: string;
  ProPublicaApiKey: string;
  TwitchClientId: string;
  TwitchAppAccessToken: string;
  GiphyApiKey: string;
  MusixMatchApiKey: string;
  OpenAIApiKey: string;
  theChannelID: string;
  theSpamChannelID: string;
  musicalChannelID: string;
  mangaChannelID: string;
  theComicChannelID: string;
  mimamuChannelId: string;
  mimamuRoleId: string;
}

export const client = new CustomClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages

  ],
  failIfNotExists: false
});

export const channelIds = new Map<string, string>();
export const roleIds = new Map<string, string>();

(async () => {
  logger.info(`Environment: ${isDevEnv() ? 'DEV' : 'PROD'}`);

  if (process.setuid) {
    logger.info('Setting bot process user id...');

    process.setuid(1000);
  }

  const path = getFilePath(FileBasePaths.Config, 'config.json');
  const text = await read(path);

  if (!text) {
    logger.error('Config file was not found!');
    process.exit(1);
  }

  const config = JSON.parse(text) as Config;

  channelIds.set('theChannel', config.theChannelID);
  channelIds.set('theSpamChannel', config.theSpamChannelID);
  channelIds.set('musicalChannel', config.musicalChannelID);
  channelIds.set('mangaChannel', config.mangaChannelID);
  channelIds.set('theComicChannel', config.theComicChannelID);
  channelIds.set('mimamuChannel', config.mimamuChannelId);

  roleIds.set('mimamuRole', config.mimamuRoleId);

  client.loadConfig(config);

  client.events = new Collection();
  client.commands = new Collection();

  await client.loadCommands();
  await client.loadEvents();

  client.login(config.token);
})();
