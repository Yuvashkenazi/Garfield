import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export const customIds = {
    promptModalId: 'prompt-modal',
    promptCreateId: 'prompt-create-input'
};

export function MiMaMuPromptModal(answer: string) {
    const promptInput = new TextInputBuilder()
        .setLabel('Enter prompt with hidden words (* = hidden)')
        .setCustomId(customIds.promptCreateId)
        .setMaxLength(1000)
        .setRequired(true)
        .setPlaceholder(answer.length >= 100 ? `${answer.slice(0, 97)}...` : answer)
        .setValue(answer)
        .setStyle(TextInputStyle.Paragraph);

    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(promptInput);
    return new ModalBuilder()
        .setTitle('MiMaMu Prompt Creation')
        .setCustomId(customIds.promptModalId)
        .addComponents(row);
}
