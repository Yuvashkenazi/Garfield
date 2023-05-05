import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { logger } from "../utils/LoggingHelper.js";

const BASE_URL = 'http://localhost:5000/name';

async function randomName(data) {
    return await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then((res: any) => {
            if (res.success) {
                return res.name;
            } else {
                logger.error(res.error);
            }
        })
        .catch(err => logger.error(err));
}

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('random-name')
        .setDescription('Generate random adjactive + name.')
        .addBooleanOption(option =>
            option.setName('alliteration')
                .setDescription('Name and adjective will start with the same letter.')
                .setRequired(true)
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const alliteration = interaction.options.getBoolean('alliteration');

        await interaction.deferReply();

        const name = await randomName({ alliteration });

        interaction.editReply(name ?? 'Error generating name.');
    }
};