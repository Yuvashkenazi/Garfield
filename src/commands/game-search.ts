import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { config } from "../settings.js";
import { query } from "../services/igdbService.js";
import { logger } from "../utils/LoggingHelper.js";

const { TwitchClientId, TwitchAppAccessToken } = config;

async function searchGame(game) {
    return await query({
        clientId: TwitchClientId,
        clientSecret: TwitchAppAccessToken,
        endpoint: 'games',
        search: game,
        fields: ['name', 'summary', 'similar_games', 'total_rating', 'release_dates']
    }).then(async data => {
        if (!!data && data.length === 0) {
            return;
        }
        const game = data[0];

        return await query({
            clientId: TwitchClientId,
            clientSecret: TwitchAppAccessToken,
            endpoint: 'covers',
            fields: ['image_id'],
            where: `game = ${game.id}`
        })
            .then(images => {
                if (!!images && images.length === 0) {
                    return;
                }
                const image = images[0];

                game.image_id = image.image_id;

                return game;
            })
            .catch(err => {
                logger.error(err);
            });
    });
}

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('game-search')
        .setDescription('Get information on a video game from IGDB.')
        .addStringOption(option =>
            option.setName('video-game')
                .setDescription('Video game title.')
                .setRequired(true)
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const vg = interaction.options.getString('video-game');

        await interaction.deferReply();

        const game = await searchGame(vg);

        if (!game) {
            interaction.editReply('Game not found.');
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(game.name)
            .addFields([
                { name: 'Rating', value: game.total_rating.toFixed(2) },
                { name: 'Summary', value: game.summary }
            ])
            .setThumbnail(`https://images.igdb.com/igdb/image/upload/t_1080p/${game.image_id}.jpg`);

        interaction.editReply({ embeds: [embed] });
    }
};