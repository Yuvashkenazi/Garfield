import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { guessMiMaMu } from '../services/MiMaMuService.js';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('guess-mimamu')
        .setDescription('Guess today\'s MiMaMu answer.')
        .addStringOption(option =>
            option.setName('guess')
                .setDescription('The prompt that will be sent to DALL-E to generate an image.')
                .setRequired(true)
                .setMaxLength(1000)
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const guess = interaction.options.getString('guess');

        await interaction.deferReply({ ephemeral: true });

        const response = await guessMiMaMu({ userId: interaction.user.id, guess });

        interaction.editReply({ content: response });
    }
};
