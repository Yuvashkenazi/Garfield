import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { toggleManga } from "../services/SettingsService.js";
import { format } from "../utils/Common.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('toggle-manga')
        .setDescription('Toggle manga.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const isMangaOn = await toggleManga();

        interaction.reply(`Manga is now toggled ${format(isMangaOn ? 'on' : 'off', { bold: true })}`);
    }
};
