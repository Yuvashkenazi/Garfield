import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { findComic } from "../services/ComicService.js";
import { BloomCounty } from "../constants/Comics.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('bloom-county')
        .setDescription('Get a random bloom county comic strip.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const comic = await findComic(BloomCounty.urlName);

        interaction.reply(comic);
    }
};
