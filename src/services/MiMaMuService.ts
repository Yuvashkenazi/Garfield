import { client } from "../index.js";
import {
    EmbedBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ModalSubmitInteraction,
    ChatInputCommandInteraction,
    Message,
    APIEmbedField
} from "discord.js";
import { getFilePath, readDir, deleteFile } from '../repository/FileRepo.js';
import { parse } from "path";
import { FileBasePaths } from "../constants/FileBasepaths.js";
import { getSettings, setDailyMiMaMuId, incrementMiMaMuNumber } from "../repository/SettingsRepo.js";
import {
    find as findUser,
    findAll as findAllUsers,
    resetDailyMiMaMuGuessCount,
    resetDailyMiMaMuGuesses,
    resetDailyMiMaMuCount,
    incrementDailyMiMaMuGuessCount,
    updateLatestMiMaMuGuess,
    incrementDailyMiMaMuCount
} from "../repository/UserRepo.js";
import {
    find as findMiMaMu,
    findAll as findAllMiMaMus,
    getRandom,
    deactivate,
    getDeactivated,
    isCreationAllowed,
    create
} from "../repository/MiMaMuRepo.js";
import { SettingsModel, UserModel, MiMaMuModel } from "../models/index.js";
import { saveWebFile } from "./WebServices.js";
import { generateImage } from "./OpenAIService.js";
import { MiMaMuGuessModal, MiMaMuPromptModal, customIds } from "../components/mimamu/index.js";
import { removePunctuation, bold, at } from "../utils/Common.js";
import { logger } from "../utils/LoggingHelper.js";

const MIMAMU_BASE_PATH = getFilePath(FileBasePaths.MiMaMu);
const MODAL_TIMEOUT = 300_000;
const USER_DAILY_LIMIT = 3;
const HIDDEN_WORD_MASK = '*';

const currentMiMaMu: {
    message?: Message
    embed?: EmbedBuilder
} = {};

export async function playMiMaMu(): Promise<void> {
    const { MiMaMuNumber, dailyMiMaMuId: yesterdayMiMaMuId } = { ...await getSettings() } as SettingsModel;

    if (yesterdayMiMaMuId) {
        const { answer: yesterdayAnswer } = { ...await findMiMaMu({ id: yesterdayMiMaMuId }) } as MiMaMuModel;

        await client.mimamuChannelId.send({ content: `MiMaMu #${MiMaMuNumber - 1}'s answer:\n**${yesterdayAnswer}**` });
    }

    const { id, answer, prompt, author } = { ...await getRandom() } as MiMaMuModel;

    if (!id) {
        await client.mimamuChannelId.send({ content: 'No MiMaMu prompts found in database.' });

        await setDailyMiMaMuId({ id: '' });
        return;
    }

    await setDailyMiMaMuId({ id });

    const guessBtn = new ButtonBuilder()
        .setCustomId('guess')
        .setLabel('Guess')
        .setStyle(ButtonStyle.Primary);

    const showPromptBtn = new ButtonBuilder()
        .setCustomId('show-prompt')
        .setLabel('Show Prompt')
        .setStyle(ButtonStyle.Secondary);

    const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(guessBtn, showPromptBtn);

    const imgFileName = `${id}.png`;
    const imgPath = getFilePath(FileBasePaths.MiMaMu, imgFileName);

    const file = new AttachmentBuilder(imgPath);

    const title = `MiMaMu #${MiMaMuNumber}`;

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(getDisplayPrompt({ prompt, answer }))
        .setFooter({ text: `prompt by ${author}` })
        .setImage(`attachment://${imgFileName}`);

    const thread = await client.mimamuChannelId.threads.create({
        name: title
    })

    const message = await thread.send({ embeds: [embed], files: [file], components: [btnRow] });

    currentMiMaMu.embed = embed;
    currentMiMaMu.message = message;

    const guessBtnCollector = message.createMessageComponentCollector({ filter: (u) => u.customId === 'guess' });
    const showPromptBtnCollector = message.createMessageComponentCollector({ filter: (u) => u.customId === 'show-prompt' });

    guessBtnCollector.on('collect', (collectedInteraction) => {
        const modal = MiMaMuGuessModal();
        collectedInteraction.showModal(modal);

        const filter = (cld: ModalSubmitInteraction) => cld.customId === customIds.guessModalId;
        collectedInteraction.awaitModalSubmit({ filter, time: MODAL_TIMEOUT })
            .then(async interaction => {
                const fields = interaction.fields;
                const guess = fields.getTextInputValue(customIds.guessInputId);

                const response = await guessMiMaMu({ userId: interaction.user.id, guess });

                interaction.deferUpdate();

                collectedInteraction.followUp({ ephemeral: true, content: response });
            })
            .catch(err => logger.error(err));
    });

    showPromptBtnCollector.on('collect', async (collectedInteraction) => {
        const id = collectedInteraction.user.id;

        const { dailyMiMaMuGuess } = { ...await findUser(id) } as UserModel;

        const pastAnswers = !dailyMiMaMuGuess ? [] : dailyMiMaMuGuess.split(';');

        const currentUserPrompt = getUpdatedUserPrompt({ prompt, answer, guesses: pastAnswers });

        collectedInteraction.reply({ ephemeral: true, content: bold(currentUserPrompt) });
    });

    await deactivate({ id });
    await incrementMiMaMuNumber();
}

export async function guessMiMaMu({ userId, guess }: { userId: string, guess: string }): Promise<string> {
    const { dailyMiMaMuId, MiMaMuNumber } = { ...await getSettings() } as SettingsModel;

    if (!dailyMiMaMuId) return 'Today\'s MiMaMu has not been found! Try again tomorrow.';

    const { dailyMiMaMuGuess, dailyMiMaMuGuessCount } = { ...await findUser(userId) } as UserModel;

    const { prompt, answer } = { ...await findMiMaMu({ id: dailyMiMaMuId }) } as MiMaMuModel;

    const pastAnswers = !dailyMiMaMuGuess ? [] : dailyMiMaMuGuess.split(';');

    const hiddenWords = getHiddenWordsArray({ prompt, answer });

    const guessArr = guess.split(' ').map(x => removePunctuation(x).trim().toLowerCase());

    const wordsLeft = [...hiddenWords].filter(x => !pastAnswers.includes(x));
    if (wordsLeft.length === 0) return 'You already won! Play again tomorrow!';

    const newlyFound = [];
    for (const guessed of guessArr) {
        if (wordsLeft.includes(guessed)) newlyFound.push(guessed);
    }

    const updatedGuesses = [...pastAnswers, ...newlyFound];
    await updateLatestMiMaMuGuess({ id: userId, guess: updatedGuesses.join(';') });

    await incrementDailyMiMaMuGuessCount({ id: userId });

    await updateLiveGuessCount();

    const currentUserPrompt = getUpdatedUserPrompt({ prompt, answer, guesses: updatedGuesses });

    const won = (newlyFound.length === wordsLeft.length &&
        newlyFound.every(x => wordsLeft.includes(x)));

    if (won) {
        const isGuessPlural = dailyMiMaMuGuessCount > 1;
        await client.mimamuChannelId.send({ content: `${at(userId)} solved MiMaMu #${MiMaMuNumber - 1} in ${dailyMiMaMuGuessCount} ${isGuessPlural ? 'guesses' : 'guess'}!` });
    }

    return won ?
        `You solved today's MiMaMu! The full prompt was:\n**${currentUserPrompt}**` :
        `Your current prompt is:\n**${currentUserPrompt}**`
}

export async function deleteDeactivatedImages(): Promise<void> {
    const deactivatedIds = (await getDeactivated()).map(x => x.id);

    const files = await readDir(MIMAMU_BASE_PATH);

    for (const file of files) {
        const parsed = parse(file);

        if (deactivatedIds.includes(parsed.name)) {
            try {
                const path = getFilePath(FileBasePaths.MiMaMu, file);
                deleteFile(path);
            } catch (error) {
                logger.error(`Failed to delete MiMaMu file: ${file}`)
                logger.error(error);
            }
        }
    }
}

export async function resetMiMaMu(): Promise<void> {
    await resetDailyMiMaMuGuessCount();
    await resetDailyMiMaMuGuesses();
    await resetDailyMiMaMuCount();
}

export async function addMiMaMuPrompt({ interaction, answer }: { interaction: ChatInputCommandInteraction, answer: string }): Promise<void> {
    const message = await interaction.deferReply({ ephemeral: true });

    const allowed = await isCreationAllowed();

    if (!allowed) {
        interaction.editReply({ content: 'The server\'s prompt limit has been reached. Try again tomorrow!' });
        return;
    }

    const user = interaction.user;

    const userEntity = await findUser(user.id);

    if (!userEntity) return;

    if (userEntity.dailyMiMaMuCount >= USER_DAILY_LIMIT) {
        interaction.editReply({ content: 'You have reached the maximum number of daily prompt creations. Try again tomorrow!' });
        return;
    }

    const { data: generatedImages, error } = await generateImage({ prompt: answer, n: 3 });

    if (error !== '') {
        interaction.editReply({ content: error });
        return;
    }

    if (generatedImages.length !== 3) {
        interaction.editReply({ content: 'Failed to retreive images.' });
        return;
    }

    await incrementDailyMiMaMuCount({ id: user.id });

    const imgSelectBtn = new ButtonBuilder()
        .setCustomId('select-image')
        .setLabel('Choose image')
        .setStyle(ButtonStyle.Primary);

    const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(imgSelectBtn);

    const embedA = new EmbedBuilder()
        .setTitle('Option A')
        .setImage(generatedImages[0].url);

    const embedB = new EmbedBuilder()
        .setTitle('Option B')
        .setImage(generatedImages[1].url);

    const embedC = new EmbedBuilder()
        .setTitle('Option C')
        .setImage(generatedImages[2].url)
        .setFooter({ text: `You have used ${userEntity.dailyMiMaMuCount + 1}/${USER_DAILY_LIMIT} of your daily prompt creations.` });

    interaction.editReply({ embeds: [embedA, embedB, embedC], components: [btnRow] });

    const collector = message.createMessageComponentCollector({ filter: (u) => u.user.id === interaction.user.id });

    collector.on('collect', (collectedInteraction) => {
        const modal = MiMaMuPromptModal(answer);
        collectedInteraction.showModal(modal);

        const filter = (cld) => cld.customId === customIds.promptModalId;
        collectedInteraction.awaitModalSubmit({ filter, time: MODAL_TIMEOUT })
            .then(async interaction => {
                const fields = interaction.fields;
                const imgSelected = fields.getTextInputValue(customIds.imgSelect).toUpperCase();
                const prompt = fields.getTextInputValue(customIds.promptCreate);
                const splitPrompt = prompt.split(' ').filter(x => x !== '');
                const splitAnswer = answer.split(' ').filter(x => x !== '');
                const errors: string[] = [];

                if (!['A', 'B', 'C'].includes(imgSelected)) {
                    errors.push('Invalid image selected.');
                }

                if (splitAnswer.length !== splitPrompt.length) {
                    errors.push('Entered prompt must have the same number of words as original prompt');
                }

                if (!prompt.includes('*')) {
                    errors.push('Entered prompt must include at least one hidden word.');
                }

                let isWordMismatch = false;
                for (let i = 0; i < splitAnswer.length; i++) {
                    if (splitPrompt[i] === undefined) continue;
                    if (splitPrompt[i] !== splitAnswer[i] && !splitPrompt[i].includes('*')) {
                        isWordMismatch = true;
                    }
                }

                if (isWordMismatch) {
                    errors.push('Entered prompt does not match original answer. Make sure to only replace words with an * and leave all other words exactly as they are.');
                }

                const isSuccess = errors.length === 0;

                if (!isSuccess) {
                    errors.unshift('**Errors found:**');
                    await interaction.reply({ ephemeral: true, content: errors.join('\n- ') });
                }
                else {
                    imgSelectBtn.setDisabled(true);
                    collectedInteraction.editReply({ embeds: [embedA, embedB, embedC], components: [btnRow] });

                    const { id } = await create({ answer, prompt, author: user.username })

                    if (id === undefined) {
                        await interaction.reply({ ephemeral: true, content: 'Prompt creation failed. Prompt limit may have been reached.' });
                        return;
                    }

                    let imgToSave = '';
                    const fileName = `${id}.png`;
                    switch (imgSelected) {
                        case 'A':
                            imgToSave = generatedImages[0].url;
                            break;
                        case 'B':
                            imgToSave = generatedImages[1].url;
                            break;
                        case 'C':
                            imgToSave = generatedImages[2].url;
                            break;
                    }

                    const path = getFilePath(FileBasePaths.MiMaMu, fileName);

                    await saveWebFile({ url: imgToSave, path });

                    await interaction.reply({ ephemeral: true, content: 'Your submission was received successfully!' });
                }
            })
            .catch(err => logger.error(err));
    });
}

export async function getAuthorCount(): Promise<{ author: string, count: number }[]> {
    const mimamus = await findAllMiMaMus({ orderBy: 'author' });

    const promptsByAuthor: { author: string, count: number }[] = [];
    for (const mimamu of mimamus) {
        const found = promptsByAuthor.find(x => x.author === mimamu.author);
        if (!found) {
            promptsByAuthor.push({ author: mimamu.author, count: 1 });
        } else {
            found.count++;
        }
    }
    return promptsByAuthor;
}

function getDisplayPrompt({ prompt, answer }: { prompt: string, answer: string }): string {
    const hiddenLetter = '\\_';
    const answerSplit = answer.split(' ');
    let result = '';
    prompt.split(' ').forEach((x, i) => {
        if (x === answerSplit[i]) {
            result += x;
        }
        else if (x.includes(HIDDEN_WORD_MASK)) {
            const hiddenWordLength = removePunctuation(answerSplit[i]).length;
            const underscores = `${hiddenLetter.repeat(hiddenWordLength)}(**${hiddenWordLength}**)`
            result += x.replace(HIDDEN_WORD_MASK, underscores);
        }

        if (i !== answerSplit.length) {
            result += ' ';
        }
    });

    return result;
}

function getHiddenWordsArray({ prompt, answer }: { prompt: string, answer: string }): Set<string> {
    const result = new Set<string>();

    const promptSplit = prompt.split(' ').map(x => removePunctuation(x).trim().toLowerCase());
    const answerSplit = answer.split(' ').map(x => removePunctuation(x).trim().toLowerCase());

    promptSplit.forEach((x, i) => {
        if (x === HIDDEN_WORD_MASK) result.add(answerSplit[i]);
    });

    return result;
}

function getUpdatedUserPrompt({ prompt, answer, guesses }: { prompt: string, answer: string, guesses: string[] }): string {
    let result = '';
    const promptSplit = prompt.split(' ');
    const answerSplit = answer.split(' ');

    promptSplit.forEach((promptWord, i) => {
        const matchedAnswer = removePunctuation(answerSplit[i]).trim().toLowerCase();
        if (promptWord.includes(HIDDEN_WORD_MASK)) {
            result += guesses.includes(matchedAnswer) ? answerSplit[i] : promptWord;
        } else {
            result += answerSplit[i];
        }

        if (i !== answerSplit.length) {
            result += ' ';
        }
    });

    return getDisplayPrompt({ prompt: result, answer });
}

async function updateLiveGuessCount() {
    if (currentMiMaMu.message && currentMiMaMu.message.editable && currentMiMaMu.embed) {
        const users = (await findAllUsers()).filter(x => x.dailyMiMaMuGuessCount > 0);

        const fields: APIEmbedField[] = users.map(x => ({ name: x.username, value: x.dailyMiMaMuGuessCount.toString(), inline: true }));
        currentMiMaMu.embed.setFields(
            { name: 'Guess count:', value: ' ', inline: false },
            ...fields);
        currentMiMaMu.message.edit({ embeds: [currentMiMaMu.embed] });
    }
}
