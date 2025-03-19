import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { CustomClient } from "../extensions/CustomClient.js";
import { WordRate } from "../constants/WordRate.js";
import { setWordRate } from '../services/SettingsService.js';
import { format } from "../utils/Common.js";

const choices = [
    { name: 'Normal', value: WordRate.NORMAL },
    { name: 'Fast', value: WordRate.FAST },
    { name: 'Slow', value: WordRate.SLOW }
];

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('word-rate')
        .setDescription('Set the rate at which garfield repeats back learned words. Leave rate blank to check current rate.')
        .addStringOption(option =>
            option.setName('rate')
                .setDescription('Pick word rate')
                .addChoices(...choices)
        ),
    async execute({ interaction, client }: { interaction: ChatInputCommandInteraction, client: CustomClient }) {
        const choice = interaction.options.getString('rate');

        if (!choice) {
            const rate = choices.find(x => x.value === client.wordRate);

            interaction.reply(`Word rate is set to: ${format(rate.name, { bold: true })}`);
        } else {
            await setWordRate({ rate: WordRate[choice] });

            const rate = choices.find(x => x.value === choice);

            interaction.reply(`Word rate changed to ${format(rate.name, { bold: true })}`);
        }
    },
    helpMsg: `
Set the rate at which garfield repeats back learned words. Options are:
- {n}: Normal
- {f}: Fast
- {s}: Slow

Leave rate blank to check current rate.`
};
