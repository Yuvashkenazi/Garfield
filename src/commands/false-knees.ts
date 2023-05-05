import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { randomFalseKnees } from "../services/FalseKneesService.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('false-knees')
        .setDescription('Get a random false knees comic strip.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const comic = randomFalseKnees();

        interaction.reply(comic);
    }
};