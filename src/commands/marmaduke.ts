import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { findComic } from "../services/ComicService.js";
import { Marmaduke } from "../constants/Comics.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('marmaduke')
        .setDescription('Get a random marmaduke comic strip.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const comic = await findComic(Marmaduke.urlName);

        interaction.reply(comic);
    }
};