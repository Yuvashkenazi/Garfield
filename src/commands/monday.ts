import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { Command } from "../types/Command.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('monday')
        .setDescription('Show garfield\'s favorite image.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const embed = new EmbedBuilder()
            .setDescription('Let me be the first to wish you a happy monday!')
            .setImage('https://cdn.discordapp.com/attachments/497557268808859649/506604462115258369/7fn8nmqba3v11.jpg');

        interaction.reply({ embeds: [embed] });
    }
};