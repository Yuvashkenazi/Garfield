import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { CustomClient } from "../extensions/CustomClient.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('vote-info')
        .setDescription('Show voting information.'),
    async execute({ interaction, client }: { interaction: ChatInputCommandInteraction, client: CustomClient }) {
        interaction.reply(`
Voting is toggled **${client.isVoteOn ? 'on' : 'off'}**
Voting time is set to **${client.voteStartTime.toUpperCase()} CST**
Current comic contendors are **${client.comic1}** and **${client.comic2}**
                `);
    },
};
