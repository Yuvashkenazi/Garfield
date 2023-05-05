import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { findComic } from "../services/ComicService.js";
import { Pearls } from "../constants/Comics.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('pearls-before-swine')
        .setDescription('Get a random pearls before swine comic strip.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const comic = await findComic(Pearls.urlName);

        interaction.reply(comic);
    }
};