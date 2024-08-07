import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { toggleVote } from "../services/SettingsService.js";
import { format } from "../utils/Common.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('toggle-votes')
        .setDescription('Toggle comic voting.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const isVotesOn = await toggleVote();

        interaction.reply(`Voting is now toggled ${format(isVotesOn ? 'on' : 'off', { bold: true })}`);
    }
};
