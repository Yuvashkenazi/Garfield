import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { CustomClient } from "../extensions/CustomClient.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('chat-theme')
        .setDescription('Check bot\'s current theme.'),
    async execute({ interaction, client }: { interaction: ChatInputCommandInteraction, client: CustomClient }) {
        interaction.reply(`${client.ChatTheme}`);
    }
};
