import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../types/Command.js';
import { setBirthday } from '../services/UserService.js';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('set-birthday')
        .setDescription('Set a user\'s birthday.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Leave blank to set your own birthday.')
        )
        .addNumberOption(option =>
            option.setName('birth-day')
                .setDescription('Day of month the user was born in.')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(31)
        )
        .addNumberOption(option =>
            option.setName('birth-month')
                .setDescription('Month the user was born in.')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(12)
        )
        .addNumberOption(option =>
            option.setName('birth-year')
                .setDescription('Year the user was born in.')
                .setRequired(true)
                .setMinValue(1900)
                .setMaxValue(new Date().getFullYear())
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }): Promise<void> {
        let user = interaction.options.getUser('user');

        if (!user) user = interaction.user

        const birthDay = interaction.options.getNumber('birth-day');
        const birthMonth = interaction.options.getNumber('birth-month');
        const birthYear = interaction.options.getNumber('birth-year');

        await interaction.deferReply();

        const birthday = new Date(birthYear, birthMonth - 1, birthDay);

        await setBirthday({ id: user.id, birthday });

        interaction.editReply('User\'s birthday has been set');
    }
};
