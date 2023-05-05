import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { config } from "../settings.js";
import giphy from "giphy-api";
import { logger } from "../utils/LoggingHelper.js";

async function randomGif() {
    return giphy(config.GiphyApiKey)
        .random('')
        .then(res => {
            return res.data.embed_url;
        })
        .catch(error => logger.error(error));
}

async function searchGif(query) {
    return giphy(config.GiphyApiKey)
        .search({ q: query, limit: 10 })
        .then(res => {
            if (res.data) {
                const numOfResults = res.data.length;
                if (numOfResults > 0) {
                    const randNum = Math.floor(Math.random() * numOfResults);

                    const searched = res.data[randNum].embed_url;

                    return searched;
                }
            }
        })
        .catch(error => logger.error(error));
}

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