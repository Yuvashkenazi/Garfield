import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { CustomClient } from "../extensions/CustomClient.js";
import { getComicDisplayName } from "../constants/Comics.js";
import { format } from "../utils/Common.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('vote-info')
        .setDescription('Show voting information.'),
    async execute({ interaction, client }: { interaction: ChatInputCommandInteraction, client: CustomClient }) {
        const isVoteOn = format(client.isVoteOn ? 'on' : 'off', { bold: true });
        const voteTime = format(`${client.voteStartTime.toUpperCase()} CST`, { bold: true });
        const comic1DisplayName = format(getComicDisplayName(client.comic1), { bold: true });
        const comic2DisplayName = format(getComicDisplayName(client.comic2), { bold: true });

        interaction.reply(`
Voting is toggled ${isVoteOn}
Voting time is set to ${voteTime}
Current comic contendors are ${comic1DisplayName} and ${comic2DisplayName}
                `);
    },
};
