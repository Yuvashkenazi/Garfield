import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { setVotingComics } from '../services/VoteService.js';
import { Comics, getComicDisplayName } from "../constants/Comics.js";

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

        await setVotingComics({ comic1, comic2 });

        const comic1DisplayName = getComicDisplayName(comic1);
        const comic2DisplayName = getComicDisplayName(comic2);

        interaction.reply(`Comics have been set to ${comic1DisplayName} vs. ${comic2DisplayName}`);
    }
};