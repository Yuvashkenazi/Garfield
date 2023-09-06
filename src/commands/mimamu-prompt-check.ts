import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { getPromptsByAuthor } from '../services/MiMaMuService.js';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('mimamu-prompt-check')
        .setDescription('Show your active mimamu prompts.'),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const promptsByAuthor = await getPromptsByAuthor({ author: interaction.user.username });

        if (promptsByAuthor.length === 0) {
            interaction.reply({ ephemeral: true, content: 'No prompts found.' })
        } else {
            let prompts = '';
            for (const prompt of promptsByAuthor) {
                prompts += `- ${prompt.answer}\n`;
            }

            interaction.reply({ ephemeral: true, content: prompts })
        }
    },
};
