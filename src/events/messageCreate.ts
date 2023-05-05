import { Events } from 'discord.js';
import { Event, MessageCreateParams } from '../types/Event.js';
import { ReactionRate } from '../constants/ReactionRate.js';
import { addMessage, randomReactionToMsg } from '../services/RandomWordService.js';
import { logger } from '../utils/LoggingHelper.js';

export const event: Event = {
    name: Events.MessageCreate,
    once: false,
    async execute({ message, client }: MessageCreateParams): Promise<void> {
        if (!message || !message.content) return;

        logger.info(message.content);

        const isBot = message.author.bot;

        if (!isBot) {
            addMessage(message.content);

            randomReactionToMsg(message, ReactionRate[client.reactionRate]);
        }
    },
};
