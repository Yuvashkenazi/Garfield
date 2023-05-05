import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { getRandomInteger } from "../utils/Common.js";
import { logger } from "../utils/LoggingHelper.js";

const WIKIPEDIA_API_BASE_URL = 'https://en.wikipedia.org/api/rest_v1/page';
const WIKIPEDIA_API_BASE_RANDOM_URL = `${WIKIPEDIA_API_BASE_URL}/random/summary`;
const WIKIPEDIA_API_BASE_SEARCH_URL = `${WIKIPEDIA_API_BASE_URL}/related`;

async function getRandomWikipediaArticle() {
    const headers = { 'Accept': 'application/json' };
    return await fetch(WIKIPEDIA_API_BASE_RANDOM_URL, { headers })
        .then(res => res.json())
        .then((res: any) => {
            return res?.content_urls?.desktop?.page;
        })
        .catch(error => {
            logger.error(error);
        });
}

async function searchWikipediaArticle(search) {
    const headers = { 'Accept': 'application/json' };
    return await fetch(`${WIKIPEDIA_API_BASE_SEARCH_URL}/${search}`, { headers })
        .then(res => res.json())
        .then((res: any) => {
            const length = res?.pages?.length ?? 0;
            if (length > 0) {
                const randNum = getRandomInteger({ max: length - 1 });
                return res.pages[randNum].content_urls?.desktop?.page;
            } else {
                return null;
            }
        })
        .catch(error => {
            logger.error(error);
        });
}

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('wikipedia')
        .setDescription('Post a random Wikipedia article.')
        .addStringOption(option =>
            option.setName('search')
                .setDescription('Search for Wikipedia article.')
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const search = interaction.options.getString('search');

        await interaction.deferReply();

        let article;
        if (!search) {
            article = await getRandomWikipediaArticle();
        } else {
            article = await searchWikipediaArticle(search);
        }

        interaction.editReply(article ?? 'Error fetching article.');
    }
};