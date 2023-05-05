import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { logger } from "../utils/LoggingHelper.js";

const BASE_URL = 'http://localhost:5000/madlib';

async function generateMadlib(data) {
    return await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then((res: any) => {
            if (res.success) {
                return res.madlib;
            } else {
                logger.error(res.error);
            }
        })
        .catch(err => logger.error(err));
}

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('madlib')
        .setDescription('Replies with random words injected in story.')
        .addStringOption(option =>
            option.setName('story')
                .setDescription('Enter a madlib story.')
                .setRequired(true)),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const story = interaction.options.getString('story');

        await interaction.deferReply();

        const madlib = await generateMadlib({ story });

        interaction.editReply(madlib ?? 'Error generating madlib.');
    }
};