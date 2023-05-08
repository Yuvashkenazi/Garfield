import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export const customIds = {
    promptModalId: 'prompt-modal',
    imgSelectId: 'img-select-input',
    promptCreateId: 'prompt-create-input'
};

export function MiMaMuPromptModal(answer: string) {
    const imgSelectInput = new TextInputBuilder()
        .setLabel('Select an image: [A, B, C]')
        .setCustomId(customIds.imgSelectId)
        .setMaxLength(1)
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    const promptInput = new TextInputBuilder()
        .setLabel('Enter prompt with hidden words (* = hidden)')
        .setCustomId(customIds.promptCreateId)
        .setMaxLength(1000)
        .setRequired(true)
        .setPlaceholder(answer.length >= 100 ? `${answer.slice(0, 97)}...` : answer)
        .setValue(answer)
        .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(imgSelectInput);
    const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(promptInput);

    return new ModalBuilder()
        .setTitle('MiMaMu Prompt Creation')
        .setCustomId(customIds.promptModalId)
        .addComponents(firstActionRow, secondActionRow);
}
