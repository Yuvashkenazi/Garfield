import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command";
import { paginate } from '../utils/Common';
import { CustomClient } from "../extensions/CustomClient";


export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Replies with explanation of commands'),
    async execute({ interaction, client }: { interaction: ChatInputCommandInteraction, client: CustomClient }) {
        let helpMsg = `
Garfield Commands
-----------------

`

        client.commands.forEach((command) => {
            helpMsg += `* ${command.data.name}: ${command.helpMsg ? command.helpMsg : command.data.description}\n\n`;
        });

        const paginated = paginate(helpMsg, '*')
            .map(page => `\`\`\`md
${page} 
\`\`\``);

        for (const [indx, page] of paginated.entries()) {
            if (indx === 0) {
                await interaction.reply(page);
            } else {
                await interaction.followUp(page);
            }
        }
    },
    helpMsg: 'Show this help message.'
};