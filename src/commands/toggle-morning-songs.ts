import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { toggleMorningSongs } from "../services/SettingsService.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('toggle-morning-songs')
        .setDescription('Toggle morning songs.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const isMorningSongsOn = await toggleMorningSongs();

        interaction.reply(`Morning songs are now toggled **${isMorningSongsOn ? 'on' : 'off'}**`);
    }
};
