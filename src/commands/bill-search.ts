import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { client } from "../index.js";
import { getRandomInteger } from "../utils/Common.js";
import { logger } from "../utils/LoggingHelper.js";

async function searchBill(subject: string) {
    const url = `https://api.propublica.org/congress/v1/bills/search.json?query=${subject}`;

    const options = {
        method: 'GET',
        headers: { 'X-API-Key': client.ProPublicaApiKey },
    };

    return await fetch(url, options)
        .then(data => data.json())
        .then((res: any) => {
            if (res.status === 'OK') {
                const bills = res.results[0].bills;
                const rndSelected = getRandomInteger({ max: bills.length });
                const selected = bills[rndSelected];

                return selected;
            }
        }).catch(err => {
            logger.error(err)
        });
}

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('bill-search')
        .setDescription('Search for U.S. Congress bills by subject.')
        .addStringOption(option =>
            option.setName('subject')
                .setDescription('Enter a subject to search')
                .setRequired(true)),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const subject = interaction.options.get('subject');

        await interaction.deferReply();

        const bill = await searchBill(subject.value.toString());

        if (!bill) {
            interaction.editReply("Bill not found.");
            return;
        }

        for (const [key, value] of Object.entries(bill)) {
            if (value === '') bill[key] = '-';
        }

        let color;

        switch (bill.sponsor_party) {
            case 'D':
                color = '#0044c9';
                break;
            case 'R':
                color = '#e81b23';
                break;
            default:
                color = '#0099ff'
        }

        const embed = new EmbedBuilder()
            .setTitle(bill.number)
            .setColor(color)
            .setURL(bill.congressdotgov_url)
            .setDescription(bill.short_title)
            .addFields([
                { name: 'Bill sponsor', value: `${bill.sponsor_title} ${bill.sponsor_name} (${bill.sponsor_party}-${bill.sponsor_state})` },
                { name: 'Summary', value: bill.summary_short },
                { name: 'Last action', value: bill.latest_major_action },
            ]);

        interaction.editReply({ embeds: [embed] });
    }
};