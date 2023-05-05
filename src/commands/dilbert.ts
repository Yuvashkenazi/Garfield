import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { findComic } from "../services/ComicService.js";
import { Dilbert } from "../constants/Comics.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('dilbert')
        .setDescription('Get a random dilbert comic strip.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const comic = await findComic(Dilbert.urlName);

        interaction.reply(comic);
    }
};