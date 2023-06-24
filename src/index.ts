import { Collection, GatewayIntentBits } from 'discord.js';
import { CustomClient } from './extensions/CustomClient.js';
import { config } from './settings.js';
import process from 'process';
import { isDevEnv } from './utils/Common.js';
import { logger } from './utils/LoggingHelper.js';

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

(async () => {
  logger.info(`Environment: ${isDevEnv() ? 'DEV' : 'PROD'}`);

  if (process.setuid) {
    logger.info('Setting bot process user id...');

    process.setuid(1000);
  }

  client.events = new Collection();
  client.commands = new Collection();

  await client.loadCommands();
  await client.loadEvents();

  client.login(config.token);
})();
