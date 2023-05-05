import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types/Command.js';
import { addMiMaMuPrompt } from '../services/MiMaMuService.js';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('add-mimamu-prompt')
        .setDescription('Adds a new prompt to be used by the daily MiMaMu channel.')
        .addStringOption(option =>
            option.setName('answer')
                .setDescription('The prompt that will be sent to DALL-E to generate an image.')
                .setRequired(true)
                .setMaxLength(1000)
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }): Promise<void> {
        const answer = interaction.options.get('answer', true).value?.toString().trim();

        if (!answer) return;

        await addMiMaMuPrompt({ interaction, answer });
    }
};
