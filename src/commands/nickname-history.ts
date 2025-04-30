import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { getNicknames } from '../repository/NicknameRepo.js';
import { list, paginate } from '../utils/Common.js';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('nickname-history')
        .setDescription('Lookup a user\'s past nicknames')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to lookup. Leave blank to lookup your own.')
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        let user = interaction.options.getUser('user');

        await interaction.deferReply();

        if (!user) user = interaction.user

        const nicknames = await getNicknames({ userId: user.id });

        const nicknameMap = new Map<string, number>(nicknames.map(x => [x.nickname, x.dateSet]));

        const displayArray = [];
        nicknameMap.forEach((val, key) => {
            const date = new Date(val);
            displayArray.push(`${date.toLocaleDateString('en-US', { year: '2-digit', month: "2-digit", day: '2-digit' })} | ${key}`);
        });

        const response = nicknames.length === 0 ?
            'No nicknames found in the database.' :
            list(displayArray);

        const paginated = paginate(response, '-');

        for (const [indx, page] of paginated.entries()) {
            if (indx === 0) {
                await interaction.editReply(page);
            } else {
                await interaction.followUp(page);
            }
        }

    }
};
