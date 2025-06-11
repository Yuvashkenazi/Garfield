import { ButtonInteraction, Events, MessageFlags } from 'discord.js';
import { Event, InteractionCreateParams } from '../types/Event.js';
import { customIds } from '../components/mimamu/index.js';
import { handleGuessBtn, handleShowPromptBtn } from '../services/MiMaMuService.js';
import { logger } from '../utils/LoggingHelper.js';

export const event: Event = {
    name: Events.InteractionCreate,
    once: false,
    async execute({ interaction, client }: InteractionCreateParams) {
        if (!interaction) return;

        if (interaction.isButton()) {
            await handleBtn(interaction);
        }

        if (!interaction.isCommand()) return;

        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute({ interaction, client });
        } catch (error) {
            logger.error(error);

            const errorMsg = 'There was an error while executing this command!';

            !interaction.replied ?
                await interaction.reply({ content: errorMsg, flags: MessageFlags.Ephemeral }) :
                await interaction.editReply({ content: errorMsg });
        }
    },
};

async function handleBtn(interaction: ButtonInteraction) {
    switch (interaction.customId) {
        case customIds.guessBtnId:
            await handleGuessBtn(interaction);
            break;
        case customIds.showPromptBtnId:
            await handleShowPromptBtn(interaction);
            break;
        default:
            break;
    }
}
