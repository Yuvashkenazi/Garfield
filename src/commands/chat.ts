import { ChatInputCommandInteraction, SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { generateSentence } from '../services/RandomWordService.js';
import { chat } from '../services/OpenAIService.js';
import { format } from '../utils/Common.js';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Chat with Garfield.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Your message to Garfield.')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Add an image to your message.')
                .setRequired(false)
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const message = interaction.options.getString('message');
        const image = interaction.options.getAttachment('image');

        await interaction.deferReply();

        const wordsToUse = await generateSentence();

        const files = image?.url ? [new AttachmentBuilder(image?.url)] : [];

        await interaction.editReply({
            files,
            content: `
Responding to: ${format(message, { bold: true })}
Using words: ${format(wordsToUse, { bold: true })}
`
        });

        await chat({
            userId: interaction.user.id,
            channel: interaction.channel,
            message,
            wordsToUse,
            imageUrl: image?.url
        });
    }
};
