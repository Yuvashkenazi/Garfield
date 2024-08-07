import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import _quotes from '../../quotes/the-office.json';
import { format, getRandomInteger } from "../utils/Common.js";

interface TheOfficeQuotes {
    season: number;
    episode: number;
    title: string;
    scenes: { "character": string; "line": string; }[][];
    deleted_scenes: { "character": string; "line": string; }[][];
}

function randomOffice() {
    const quotes = _quotes as TheOfficeQuotes[];
    const randEp = getRandomInteger({ max: quotes.length });
    const randEpQuotes = quotes[randEp];
    const randEpQuotesLength = randEpQuotes.scenes.length;

    let randomQuoteInEp = Math.floor(Math.random() * randEpQuotesLength);
    let RandQuote = randEpQuotes.scenes[randomQuoteInEp];

    while (RandQuote.length === 1) {
        randomQuoteInEp = Math.floor(Math.random() * randEpQuotesLength);
        RandQuote = randEpQuotes.scenes[randomQuoteInEp];
    }

    const quoteTitle = format('Office Quote', { underline: true, bold: true });
    const seasonText = format('Season:', { bold: true });
    const episodeText = format('Episode:', { bold: true });
    const epTitleText = format('Title:', { bold: true });

    let result = `${quoteTitle}
  
        ${seasonText} ${randEpQuotes.season}
        ${episodeText} ${randEpQuotes.episode}
        ${epTitleText} ${randEpQuotes.title}
        `;

    for (let i = 1; i < RandQuote.length; i++) {
        result += '\n\n';
        result += format(RandQuote[i].character, { bold: true });
        result += '\n';
        result += RandQuote[i].line;
    }

    return result.length > 1800 ? 'Quote is too long!' : result;
}

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('office')
        .setDescription('Get a random scene from The Office.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const quote = randomOffice();

        interaction.reply(quote);
    }
};