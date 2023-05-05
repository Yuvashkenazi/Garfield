import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { logger } from "../utils/LoggingHelper.js";

const DAD_JOKE_BASE_URL = 'https://icanhazdadjoke.com/';

async function GetDadJoke() {
    const headers = { 'Accept': 'application/json' };
    return await fetch(DAD_JOKE_BASE_URL, { headers })
        .then(res => res.json())
        .then((res: any) => {
            return res.joke;
        })
        .catch(error => {
            logger.error(error);
        });
}

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('dad-joke')
        .setDescription('Get a random dad joke.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        await interaction.deferReply();

        const joke = await GetDadJoke();

        interaction.editReply(joke ?? 'Joke not found.');
    }
};