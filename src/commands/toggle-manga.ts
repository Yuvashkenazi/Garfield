import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { CustomClient } from "../extensions/CustomClient.js";
import { toggleManga } from "../repository/SettingsRepo.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('toggle-manga')
        .setDescription('Toggle manga.'),
    async execute({ interaction, client }: { interaction: ChatInputCommandInteraction, client: CustomClient }) {
        const isMangaOn = await toggleManga();

        client.isMangaOn = isMangaOn;

        interaction.reply(`Manga is now toggled **${isMangaOn ? 'on' : 'off'}**`);
    }
};