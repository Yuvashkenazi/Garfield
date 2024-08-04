import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { randomGif, searchGif } from '../services/giphyService.js';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('gif')
        .setDescription('Generate random adjactive + name.')
        .addStringOption(option =>
            option.setName('search')
                .setDescription('Search for a gif from Giphy.')
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const search = interaction.options.getString('search');

        await interaction.deferReply();

        let gif;
        if (!search) {
            gif = await randomGif();
        } else {
            gif = await searchGif(search);
        }

        interaction.editReply(gif ?? 'gif not found.');
    }
};