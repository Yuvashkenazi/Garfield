import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { findComic } from "../services/ComicService.js";
import { Fuzzy } from "../constants/Comics.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('get-fuzzy')
        .setDescription('Get a random getfuzzy comic strip.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const comic = await findComic(Fuzzy.urlName);

        interaction.reply(comic);
    }
};