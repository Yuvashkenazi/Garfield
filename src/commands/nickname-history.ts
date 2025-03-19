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

        const nicknameSet = new Set<string>(nicknames.map(x => x.nickname));

        const response = nicknames.length === 0 ?
            'No nicknames found in the database.' :
            list([...nicknameSet]);

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
