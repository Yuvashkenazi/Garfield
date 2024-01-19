import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { CustomClient } from "../extensions/CustomClient.js";
import { getGuildMemebers, setChatTheme } from "../services/SettingsService.js";

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('set-bot')
        .setDescription('Set bot theme.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Set bot name')
                .setRequired(false))
        .addAttachmentOption(option =>
            option.setName('avatar')
                .setDescription('Set bot avatar')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('identity')
                .setDescription('Set bot identity')
                .setRequired(false)),
    async execute({ interaction, client }: { interaction: ChatInputCommandInteraction, client: CustomClient }) {
        const members = await getGuildMemebers();

        const botUser = client.user
        const botGuildMember = members.find(x => x.id === botUser.id);

        const name = interaction.options.getString('name');
        const avatar = interaction.options.getAttachment('avatar');
        const identity = interaction.options.getString('identity');

        if (!name && !avatar && !identity) {
            interaction.reply('I have not been updated.');
            return;
        };

        if (name) {
            await botGuildMember.setNickname(name);
        }
        if (avatar) {
            await botUser.setAvatar(avatar.url);
        }
        if (identity) {
            await setChatTheme({ theme: identity });
        }

        interaction.reply('I have been updated.');
    }
};
