import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { client } from "../index.js";
import { logger } from "../utils/LoggingHelper.js";

const { MusixMatchApiKey } = client;

async function songLyrics(artist, song) {
    const url = `https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?format=json&callback=callback&q_track=${song}&q_artist=${artist}&apikey=${MusixMatchApiKey}`;

    return await fetch(url)
        .then(data => data.json())
        .then((res: any) => {
            if (!res?.message?.body?.lyrics) {
                return;
            }

            if (res.message.header.status_code === 200) {
                const lyrics = res.message.body.lyrics.lyrics_body.replace('******* This Lyrics is NOT for Commercial use *******', '');

                return lyrics
            }
        }).catch(err => {
            logger.error(err)
        });
}

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('song-lyrics')
        .setDescription('Searches for song lyrics from musixmatch.')
        .addStringOption(option =>
            option.setName('artist')
                .setDescription('Name of artist.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('song')
                .setDescription('Name of song.')
                .setRequired(true)
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const artist = interaction.options.getString('artist');
        const song = interaction.options.getString('song');

        await interaction.deferReply();

        const lyrics = await songLyrics(artist, song);

        interaction.editReply(lyrics ?? 'Song not found.');
    }
};
