import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { CustomClient } from "../extensions/CustomClient.js";
import { getAuthorCount } from '../services/MiMaMuService.js';
import { format } from '../utils/Common.js';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('mimamu-info')
        .setDescription('Show MiMaMu information.'),
    async execute({ interaction, client }: { interaction: ChatInputCommandInteraction, client: CustomClient }) {
        const promptsByAuthor = await getAuthorCount();
        const count = promptsByAuthor.reduce((acc, curr) => acc += curr.count, 0);

        const description = `
MiMaMu is toggled ${client.isMiMaMuOn ? format('on', { bold: true }) : format('off', { bold: true })}
MiMaMu time is set to ${format(`${client.MiMaMuStartTime.toUpperCase()} CST`, { bold: true })}
There are ${format(`${count}/30`, { bold: true })} prompts available
`;

        const fields = promptsByAuthor.map(x => ({ name: x.author, value: x.count.toString(), inline: true }))
        const fieldsArray = fields.length === 0 ? [] :
            [{ name: 'Current Prompt Authors:', value: ' ', inline: false },
            ...fields]

        const info = new EmbedBuilder()
            .setTitle('MiMaMu Info')
            .setDescription(description)
            .addFields(fieldsArray);

        interaction.reply({ embeds: [info] });
    },
};
