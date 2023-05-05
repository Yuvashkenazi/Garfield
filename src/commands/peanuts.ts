import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { findComic } from "../services/ComicService.js";
import { Peanuts } from "../constants/Comics.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('peanuts')
        .setDescription('Get a random peanuts comic strip.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const comic = await findComic(Peanuts.urlName);

        interaction.reply(comic);
    }
};