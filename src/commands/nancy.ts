import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { findComic } from "../services/ComicService.js";
import { Nancy } from "../constants/Comics.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('nancy')
        .setDescription('Get a random nancy comic strip.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const comic = await findComic(Nancy.urlName);

        interaction.reply(comic);
    }
};