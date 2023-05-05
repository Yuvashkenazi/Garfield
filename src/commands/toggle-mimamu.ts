import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { CustomClient } from "../extensions/CustomClient.js";
import { toggleMiMaMu } from "../repository/SettingsRepo.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('toggle-mimamu')
        .setDescription('Toggle daily MiMaMu.'),
    async execute({ interaction, client }: { interaction: ChatInputCommandInteraction, client: CustomClient }) {
        const isMiMaMuOn = await toggleMiMaMu();

        client.isMiMaMuOn = isMiMaMuOn;

        interaction.reply(`MiMaMu is now toggled **${isMiMaMuOn ? 'on' : 'off'}**`);
    }
};