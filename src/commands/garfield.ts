import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { findComic } from "../services/ComicService.js";
import { Garfield } from "../constants/Comics.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('garfield')
        .setDescription('Get a random garfield comic strip.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const comic = await findComic(Garfield.urlName);

        interaction.reply(comic);
    }
};