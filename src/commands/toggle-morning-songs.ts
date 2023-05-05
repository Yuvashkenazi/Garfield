import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { CustomClient } from "../extensions/CustomClient.js";
import { toggleMorningSongs } from "../repository/SettingsRepo.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('toggle-morning-songs')
        .setDescription('Toggle morning songs.'),
    async execute({ interaction, client }: { interaction: ChatInputCommandInteraction, client: CustomClient }) {
        const isMorningSongsOn = await toggleMorningSongs();

        client.isMorningSongsOn = isMorningSongsOn;

        interaction.reply(`Morning songs are now toggled **${isMorningSongsOn ? 'on' : 'off'}**`);
    }
};