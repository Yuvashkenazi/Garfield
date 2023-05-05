import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { CustomClient } from "../extensions/CustomClient.js";
import { toggleVote } from "../repository/SettingsRepo.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('toggle-votes')
        .setDescription('Toggle comic voting.'),
    async execute({ interaction, client }: { interaction: ChatInputCommandInteraction, client: CustomClient }) {
        const isVotesOn = await toggleVote();

        client.isVoteOn = isVotesOn;

        interaction.reply(`Voting is now toggled **${isVotesOn ? 'on' : 'off'}**`);
    }
};
