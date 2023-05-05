import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import seinfeldQuotes from '../../quotes/seinfeld.json';
import { getRandomInteger } from '../utils/Common.js';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('seinfeld')
        .setDescription('Get a random seinfeld quote.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const rndIndex = getRandomInteger({ max: seinfeldQuotes.length - 1 });

        const quote = seinfeldQuotes[rndIndex];

        interaction.reply(quote);
    }
};