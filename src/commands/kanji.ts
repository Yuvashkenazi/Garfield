import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { Command } from "../types/Command";
import jishoApi from "unofficial-jisho-api";
const jisho = new jishoApi();

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('kanji')
        .setDescription('Get information on a kanji character from Jisho.')
        .addStringOption(option =>
            option.setName('kanji')
                .setDescription('Kanji character to search.')
                .setRequired(true)
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const kanji = interaction.options.getString('kanji');

        await interaction.deferReply();

        const result = await jisho.searchForKanji(kanji);

        if (!result.found) {
            interaction.editReply('Kanji not found.');
            return;
        }

        for (const [key, value] of Object.entries(result)) {
            if (Array.isArray(value)) result[key] = value.join();
            if (!result[key]) result[key] = 'N/A';
        }

        const embed = new EmbedBuilder()
            .setTitle(kanji)
            .setImage(result.strokeOrderGifUri)
            .addFields(
                { name: 'Meaning', value: result.meaning, inline: true },
                { name: 'Stroke Count', value: result.strokeCount.toString(), inline: true },
                { name: 'Taught In', value: result.taughtIn, inline: true },
                { name: 'Parts', value: result.parts.join(' '), inline: true },
                { name: 'Kunyomi', value: result.kunyomi.join(' '), inline: true },
                { name: 'Onyomi', value: result.onyomi.join(' '), inline: true },
            );

        interaction.editReply({ embeds: [embed] });
    }
};