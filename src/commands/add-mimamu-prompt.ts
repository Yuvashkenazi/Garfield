import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types/Command.js';
import { addMiMaMuPrompt } from '../services/MiMaMuService.js';
import { MidjourneyOptions } from '../services/MidjourneyService.js';
import { MidjourneyStyles } from '../constants/MidjourneyStyles.js';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('add-mimamu-prompt')
        .setDescription('Adds a new prompt to be used by the daily MiMaMu channel.')
        .addStringOption(option =>
            option.setName('answer')
                .setDescription('The prompt that will be sent to Midjourney to generate an image.')
                .setRequired(true)
                .setMaxLength(1000)
        )
        .addStringOption(option =>
            option.setName('style')
                .setDescription('Select which model to use')
                .setRequired(true)
                .addChoices(
                    { name: 'Midjourney Default', value: MidjourneyStyles.MJ_DEFAULT },
                    { name: 'Midjourney Raw', value: MidjourneyStyles.MJ_RAW },
                    { name: 'Niji Default', value: MidjourneyStyles.NIJI_DEFAULT },
                    { name: 'Niji Cute', value: MidjourneyStyles.NIJI_CUTE },
                    { name: 'Niji Scenic', value: MidjourneyStyles.NIJI_SCENIC },
                    { name: 'Niji Expressive', value: MidjourneyStyles.NIJI_EXPRESSIVE }
                )
        )
        .addNumberOption(option =>
            option.setName('chaos')
                .setDescription('The chaos parameter influences how varied the initial image grids are.')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(100)
        )
        .addNumberOption(option =>
            option.setName('weird')
                .setDescription('Explore unconventional aesthetics with the experimental weird parameter. Not compatible with niji.')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(3000)
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }): Promise<void> {
        const answer = interaction.options.getString('answer').trim();
        const style = interaction.options.getString('style');
        const chaos = interaction.options.getNumber('chaos');
        const weird = interaction.options.getNumber('weird');

        const isNiji = style === MidjourneyStyles.NIJI_DEFAULT ||
            style === MidjourneyStyles.NIJI_CUTE ||
            style === MidjourneyStyles.NIJI_SCENIC ||
            style === MidjourneyStyles.NIJI_EXPRESSIVE;

        const options: MidjourneyOptions = {
            style,
            chaos,
            weird: isNiji ? null : weird
        };

        if (!answer) return;

        await addMiMaMuPrompt({ interaction, answer, options });
    }
};
