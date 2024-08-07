import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { CustomClient } from "../extensions/CustomClient.js";
import { ReactionRate } from "../constants/ReactionRate.js";
import { setReactionRate } from '../services/SettingsService.js';
import { format } from "../utils/Common.js";

const choices = [
    { name: 'Normal', value: ReactionRate.NORMAL },
    { name: 'Fast', value: ReactionRate.FAST },
    { name: 'Slow', value: ReactionRate.SLOW },
    { name: 'Random', value: ReactionRate.RANDOM }
];

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('reaction-rate')
        .setDescription('Set the rate at which garfield reacts to messages. Leave rate blank to check current rate.')
        .addStringOption(option =>
            option.setName('rate')
                .setDescription('Pick reaction rate')
                .addChoices(...choices)
        ),
    async execute({ interaction, client }: { interaction: ChatInputCommandInteraction, client: CustomClient }) {
        const choice = interaction.options.getString('rate');

        if (!choice) {
            const rate = choices.find(x => x.value === client.reactionRate);

            interaction.reply(`Reaction rate is set to: ${format(rate.name, { bold: true })}`);
        } else {
            await setReactionRate({ rate: ReactionRate[choice] })

            const rate = choices.find(x => x.value === choice);

            interaction.reply(`Reaction rate changed to ${format(rate.name, { bold: true })}`);
        }
    }
};
