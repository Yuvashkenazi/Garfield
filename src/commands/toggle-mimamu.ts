import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { toggleMiMaMu } from "../services/SettingsService.js";
import { format } from "../utils/Common.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('toggle-mimamu')
        .setDescription('Toggle daily MiMaMu.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const isMiMaMuOn = await toggleMiMaMu();

        interaction.reply(`MiMaMu is now toggled ${format(isMiMaMuOn ? 'on' : 'off', { bold: true })}`);
    }
};
