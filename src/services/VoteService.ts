import { client } from "../index.js";
import { TextChannel, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getVotes, updateScore } from "../repository/VotesRepo.js";
import { groupBy } from "../utils/Common.js";
import { findComic, getComicObj } from "./ComicService.js";
import { ComicInfo } from "../constants/Comics.js";
import { logger } from "../utils/LoggingHelper.js";

const COMIC_VOTING_PERIOD = 7200000;

export async function sendComicVote() {
    await setVotingComics();

    const comicObj1 = getComicObj(client.comic1);
    const comicObj2 = getComicObj(client.comic2);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('comic1')
                .setLabel(comicObj1.displayName)
                .setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('comic2')
                .setLabel(comicObj2.displayName)
                .setStyle(ButtonStyle.Secondary),
        );

    await postVotingComics(client.theComicChannel, comicObj1, comicObj2);

    client.theComicChannel.send({ content: 'Vote!', components: [row] });

    const filter = m => m.customId === 'comic1' || m.customId === 'comic2'

    const collector = client.theComicChannel.createMessageComponentCollector({ filter: filter, time: COMIC_VOTING_PERIOD });

    collector.on('collect', async interaction => {
        const { customId } = interaction;

        if (customId === 'comic1')
            await interaction.reply({ content: `You voted for ${comicObj1.displayName}.`, ephemeral: true });

        if (customId === 'comic2')
            await interaction.reply({ content: `You voted for ${comicObj2.displayName}.`, ephemeral: true });
    });

    collector.on('end', async (interaction) => {
        //TODO: NEED TO TEST THIS!!!!
        // const array = Array.from(interaction, ([name, value]) => ({ name, value, id: value.member.id }));
        const array = Array.from(interaction, ([name, value]) => ({ name, value, id: value.member.user.id }));
        const grouped = groupBy(array, 'id');
        const map = new Map(Object.entries(grouped));

        //only save last button pressed per user
        for (const [key, value] of map) {
            map.set(key, value.reduce((a, b) => a.value.createdTimestamp > b.value.createdTimestamp ? a : b).value);
        }

        let comic1Score, comic2Score;
        comic1Score = comic2Score = 0;

        map.forEach(x => {
            if (x.customId === 'comic1') comic1Score++;
            if (x.customId === 'comic2') comic2Score++;
        });

        const votes = await getVotes();
        if (!votes) return;

        let comic1 = votes.comic1Score;
        let comic2 = votes.comic2Score;
        let ties = votes.ties;
        let message = '';

        if (comic1Score > comic2Score) {
            message = `${comicObj1.displayName} won!`;
            comic1++;
        } else if (comic2Score > comic1Score) {
            message = `${comicObj2.displayName} won!`;
            comic2++;
        } else {
            message = 'It\'s a tie!';
            ties++;
        }

        await updateScore({ comic1, comic2, ties: ties, });

        const result = new EmbedBuilder()
            .setTitle('Vote Complete!')
            .setDescription(message)
            .addFields([
                { name: comicObj1.displayName, value: comic1Score.toString(), inline: true },
                { name: comicObj2.displayName, value: comic2Score.toString(), inline: true },
                {
                    name: 'Scoreboard', value: `
                **${comicObj1.displayName}:** ${comic1}
                **${comicObj2.displayName}:** ${comic2}
                **Ties:** ${ties}
                ` },
            ]);

        client.theComicChannel.send({ embeds: [result] });
    });
}

async function postVotingComics(ch: TextChannel, comicObj1: ComicInfo, comicObj2: ComicInfo): Promise<void> {
    const comic1 = await findComic(comicObj1.urlName);
    const comic2 = await findComic(comicObj2.urlName);

    const embed1 = new EmbedBuilder().setImage(comic1);
    const embed2 = new EmbedBuilder().setImage(comic2);

    ch.send({ embeds: [embed1] });
    ch.send({ embeds: [embed2] });
}

async function setVotingComics(): Promise<void> {
    const votes = await getVotes();
    if (!votes) return;

    client.comic1 = votes.comic1Name;
    client.comic2 = votes.comic2Name;

    logger.info(`Comics set to ${client.comic1} vs. ${client.comic2}`)
}
