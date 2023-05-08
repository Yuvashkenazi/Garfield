import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export const customIds = {
    guessModalId: 'guess-modal',
    guessInputId: 'guess-input'
};

export function MiMaMuGuessModal() {
    const guessInput = new TextInputBuilder()
        .setLabel('')
        .setCustomId(customIds.guessInputId)
        .setMaxLength(1000)
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(guessInput);

    return new ModalBuilder()
        .setTitle('Guess MiMaMu')
        .setCustomId(customIds.guessModalId)
        .addComponents(row);
}
