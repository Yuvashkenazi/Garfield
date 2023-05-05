import { Events } from 'discord.js';
import { Event, InteractionCreateParams } from '../types/Event.js';
import { logger } from '../utils/LoggingHelper.js';

export const event: Event = {
    name: Events.InteractionCreate,
    once: false,
    async execute({ interaction, client }: InteractionCreateParams) {
        if (!interaction || !interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute({ interaction, client });
        } catch (error) {
            logger.error(error);

            const errorMsg = 'There was an error while executing this command!';

            !interaction.replied ?
                await interaction.reply({ ephemeral: true, content: errorMsg }) :
                await interaction.editReply({ content: errorMsg });
        }
    },
};
