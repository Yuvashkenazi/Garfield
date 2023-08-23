import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { playMiMaMu } from '../services/MiMaMuService.js';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('lightning-mimamu')
        .setDescription('Play a lightning round of MiMaMu.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        await playMiMaMu({ isLightning: true });

        interaction.reply('Starting MiMaMu lightning round!');
    }
};
