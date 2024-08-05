import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { randomPoorlyDrawn } from "../services/PoorlyDrawnService.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('poorly-drawn-lines')
        .setDescription('Get a random poorly drawn lines comic strip.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        await interaction.deferReply();

        const comic = await randomPoorlyDrawn();

        interaction.editReply(comic);
    }
};
