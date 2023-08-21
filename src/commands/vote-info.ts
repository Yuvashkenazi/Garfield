import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { CustomClient } from "../extensions/CustomClient.js";
import { format24To12HR } from '../utils/Common.js';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('vote-info')
        .setDescription('Show voting information.'),
    async execute({ interaction, client }: { interaction: ChatInputCommandInteraction, client: CustomClient }) {
        interaction.reply(`
Voting is toggled **${client.isVoteOn ? 'on' : 'off'}**
Voting time is set to **${format24To12HR(client.voteStartTime)} CST**
Current comic contendors are **${client.comic1}** and **${client.comic2}**
                `);
    },
};
