import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { getNicknames } from '../repository/NicknameRepo.js';
import { format, list, paginate } from '../utils/Common.js';

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

        if (!user) user = interaction.user;

        const nicknames = await getNicknames({ userId: user.id });

        const nicknameMap = nicknames.map((x, i) => ({
            nickname: x.nickname,
            dateSet: x.dateSet,
            duration: i === nicknames.length - 1
                ? "Current"
                : `${Math.ceil((nicknames[i + 1].dateSet - x.dateSet) / (1000 * 60 * 60 * 24))} days`
        }));

        const displayArray = nicknameMap.map(({ nickname, dateSet, duration }) => {
            const date = new Date(dateSet);
            return `${date.toLocaleDateString('en-US', { year: '2-digit', month: "2-digit", day: '2-digit' })}: ${format(nickname, { bold: true })} (${duration})`;
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
