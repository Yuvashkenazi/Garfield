import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { randomFarSide } from "../services/FarSideService.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('far-side')
        .setDescription('Get a random far side county comic strip.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        await interaction.deferReply();

        const msg = await randomFarSide();

        interaction.editReply(msg);
    }
};