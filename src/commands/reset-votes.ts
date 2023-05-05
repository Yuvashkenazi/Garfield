import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { resetVotes } from "../repository/VotesRepo.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('reset-votes')
        .setDescription('Reset votes for current comics.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        await resetVotes();

        interaction.reply('Votes have been reset.');
    }
};