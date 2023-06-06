import { MiMaMuGuessModal, customIds as guessModalCustomIds } from './mimamuGuessModal.js';
import { MiMaMuPromptModal, customIds as promptModalCustomIds } from './mimamuPromptModal.js';

const customIds = {
    ...guessModalCustomIds,
    ...promptModalCustomIds,
    guessBtnId: 'guess-btn',
    showPromptBtnId: 'show-prompt-btn'
};

export {
    MiMaMuGuessModal,
    MiMaMuPromptModal,
    customIds
}
