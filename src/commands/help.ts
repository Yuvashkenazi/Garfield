import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command";

const helpMsg = `
Garfield Commands
-----------------

* help / h: Show this help message.

* restart-garfield: Pull latest code and then restart

* voteinfo: Show voting information.

* setcomics: Set comics for vote.

* resetvotes: Reset votes for current comics.

* togglevote: Toggle comic voting.

* togglemanga: Toggle manga.

* togglemorningsongs: Toggle morning songs.

* rate [rate]: Set the rate at which garfield repeats back learned words. Options are:
- {n}: Normal
- {f}: Fast
- {s}: Slow

Leave rate blank to check current rate.

* dadjoke: Get a random dad joke.

* bill [subject]: Search for U.S. Congress bills by subject.

* madlib [story]: Garfield will reply with the same story, but will replace:
- {name}: random adj  first name
- {name a}: random adj  first name (alliteration)
- {noun}: random noun
- {adj}: random adjective
- {verb}: random verb (base)
- {verb:past}: random verb (past)
- {verb:ies}: random verb (s / es/ ies)
- {verb:ing}: random verb (ing)

* name [a]: Generate a random adj  first name. Add 'a' flag to indicate alliteration.

* gif: Get a random gif from Giphy.

* gif [gif-search]: Search for a gif from Giphy.

* vg [video-game-title]: Get information on a video game from IGDB.

* lyrics [artist]/[song]: Searches for song lyrics from musixmatch.

* mastermind: Initiate a user-specific game of mastermind. Use guess [your-guess] to play. The answer is a non-duplicate 4 digit code (1-6).

* kanji [kanji]: Get information on a kanji character from Jisho.

* wikipedia: Post a random wikipedia article.

* garfield: Get a random garfield comic strip.

* dilbert: Get a random dilbert comic strip.

* cal: Get a random calvin and hobbes comic strip.

* fuzzy: Get a random getfuzzy comic strip.

* bloom: Get a random bloom county comic strip.

* far: Get a random far side county comic strip.

* pearls: Get a random pearls before swine comic strip.

* nancy: Get a random nancy comic strip.

* peanuts: Get a random peanuts comic strip.

* marmaduke: Get a random marmaduke comic strip.

* office: Get a random scene from The Office.

* seinfeld: Get a random seinfeld quote.

* monday: Show garfield's favorite image.
`

const chunkString = (str) => str.match(/(?=[\s\S])(?:.*\n?){1,50}/g);

const formatChunckedString = (msg, page, totalPages) => `\`\`\`md
${msg}
${page}/${totalPages}
\`\`\``;

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Replies with explanation of commands'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const chunked = chunkString(helpMsg);
        if (!chunked) return;

        let page = 1;
        for (const chunk of chunked) {
            const msg = formatChunckedString(chunk, page, chunked.length);
            if (page === 1)
                await interaction.reply(msg);
            else
                await interaction.followUp(msg);

            page++;
        }
    },
};