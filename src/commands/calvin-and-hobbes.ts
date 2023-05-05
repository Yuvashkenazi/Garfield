import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { findComic } from "../services/ComicService.js";
import { Calvin } from "../constants/Comics.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('calvin-and-hobbes')
        .setDescription('Get a random calvin and hobbes comic strip.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const comic = await findComic(Calvin.urlName);

        interaction.reply(comic);
    }
};
