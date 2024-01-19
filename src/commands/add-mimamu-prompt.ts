import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types/Command.js';
import { MiMaMuOptions, addMiMaMuPrompt } from '../services/MiMaMuService.js';
import { MiMaMuStyles } from '../constants/MiMaMuStyles.js';

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
                .setDescription('Select which model to use. Defaults to Dall-E 3.')
                .setRequired(false)
                .addChoices(
                    { name: 'Dall-E 3', value: MiMaMuStyles.DALLE3 },
                    { name: 'Midjourney Default', value: MiMaMuStyles.MJ_DEFAULT },
                    { name: 'Midjourney Raw', value: MiMaMuStyles.MJ_RAW },
                    { name: 'Niji Default', value: MiMaMuStyles.NIJI_DEFAULT },
                    { name: 'Niji Cute', value: MiMaMuStyles.NIJI_CUTE },
                    { name: 'Niji Scenic', value: MiMaMuStyles.NIJI_SCENIC },
                    { name: 'Niji Expressive', value: MiMaMuStyles.NIJI_EXPRESSIVE }
                )
        )
        .addNumberOption(option =>
            option.setName('chaos')
                .setDescription('The chaos parameter influences how varied the initial image grids are. MJ only.')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(100)
        )
        .addNumberOption(option =>
            option.setName('weird')
                .setDescription('Explore unconventional aesthetics with the experimental weird parameter. MJ only.')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(3000)
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }): Promise<void> {
        const answer = interaction.options.getString('answer').trim();
        const style = interaction.options.getString('style') ?? MiMaMuStyles.DALLE3;
        const chaos = interaction.options.getNumber('chaos');
        const weird = interaction.options.getNumber('weird');

        const isNiji = style === MiMaMuStyles.NIJI_DEFAULT ||
            style === MiMaMuStyles.NIJI_CUTE ||
            style === MiMaMuStyles.NIJI_SCENIC ||
            style === MiMaMuStyles.NIJI_EXPRESSIVE;

        const options: MiMaMuOptions = {
            style,
            chaos,
            weird: isNiji ? null : weird
        };

        if (!answer) return;

        await addMiMaMuPrompt({ interaction, answer, options });
    }
};
