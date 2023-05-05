import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { CustomClient } from "../extensions/CustomClient.js";
import { getAuthorCount } from '../services/MiMaMuService.js';
import { bold } from '../utils/Common.js';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('mimamu-info')
        .setDescription('Show MiMaMu information.'),
    async execute({ interaction, client }: { interaction: ChatInputCommandInteraction, client: CustomClient }) {
        const promptsByAuthor = await getAuthorCount();
        const count = promptsByAuthor.reduce((acc, curr) => acc += curr.count, 0);

        const fields = promptsByAuthor.map(x => ({ name: x.author, value: x.count.toString(), inline: true }))

        const description = `
MiMaMu is toggled ${client.isMiMaMuOn ? bold('on') : bold('off')}
MiMaMu time is set to ${bold(`${client.MiMaMuStartTime.toUpperCase()} CST`)}
There are ${bold(`${count}/30`)} prompts available
`;

        const info = new EmbedBuilder()
            .setTitle('MiMaMu Info')
            .setDescription(description)
            .addFields(
                { name: 'Current Prompt Authors:', value: ' ', inline: false },
                ...fields
            );

        interaction.reply({ embeds: [info] });
    },
};
