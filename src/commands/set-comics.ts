import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { updateNames } from "../repository/VotesRepo.js";
import { Comics } from "../constants/Comics.js";

const comics = Object.values(Comics).map(x => {
    return { name: x.displayName, value: x.urlName };
});

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('set-comics')
        .setDescription('Set comics for vote.')
        .addStringOption(option =>
            option.setName('comic1')
                .setDescription('Pick first comic')
                .setRequired(true)
                .addChoices(...comics)
        )
        .addStringOption(option =>
            option.setName('comic2')
                .setDescription('Pick second comic')
                .setRequired(true)
                .addChoices(...comics)
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const comic1 = interaction.options.getString('comic1');
        const comic2 = interaction.options.getString('comic2');

        await updateNames({ comic1, comic2 });

        interaction.reply(`Comics have been set to ${comic1} vs. ${comic2}`);
    }
};