import { MiMaMuGuessModal, customIds as guessModalCustomIds } from './mimamuGuessModal.js';
import { MiMaMuPromptModal, customIds as promptModalCustomIds } from './mimamuPromptModal.js';

const customIds = {
    ...guessModalCustomIds,
    ...promptModalCustomIds
};

export {
    MiMaMuGuessModal,
    MiMaMuPromptModal,
    customIds
}