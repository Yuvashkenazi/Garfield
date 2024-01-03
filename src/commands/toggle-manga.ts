import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { toggleManga } from "../services/SettingsService.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('toggle-manga')
        .setDescription('Toggle manga.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const isMangaOn = await toggleManga();

        interaction.reply(`Manga is now toggled **${isMangaOn ? 'on' : 'off'}**`);
    }
};
