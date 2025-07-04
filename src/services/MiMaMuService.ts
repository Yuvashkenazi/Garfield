import { client } from "../index.js";
import {
    User,
    EmbedBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    ButtonInteraction,
    ModalSubmitInteraction,
    MessageFlags
} from "discord.js";
import { v4 as uuid } from 'uuid';
import { exists, getFilePath, readDir, deleteDir, join, mkdir } from '../repository/FileRepo.js';
import { FileBasePaths } from "../constants/FileBasepaths.js";
import { MiMaMuStyles } from "../constants/MiMaMuStyles.js";
import { setDailyMiMaMuId, incrementMiMaMuNumber } from '../services/SettingsService.js';
import {
    find as findUser,
    resetDailyMiMaMuGuessCount,
    resetDailyMiMaMuGuesses,
    incrementDailyMiMaMuGuessCount,
    updateLatestMiMaMuGuess
} from "../services/UserService.js";
import {
    find as findMiMaMu,
    findAll as findAllMiMaMus,
    findByAuthor,
    getLatest,
    getRandom,
    deactivate,
    isCreationAllowed,
    create
} from "../repository/MiMaMuRepo.js";
import { UserModel, MiMaMuModel } from "../models/index.js";
import { MiMaMuGuessModal, MiMaMuPromptModal, customIds } from "../components/mimamu/index.js";
import { removePunctuation, format, at } from "../utils/Common.js";
import { logger } from "../utils/LoggingHelper.js";
import { imagine } from "./MidjourneyService.js";
import { generateImage } from "./OpenAIService.js";
import { saveWebFile } from "./WebServices.js";
import OpenAI from "openai";

export type MiMaMuOptions = {
    style: string;
    chaos?: number
    weird?: number
};

export const MIMAMU_BASE_PATH = getFilePath(FileBasePaths.MiMaMu);
const HIDDEN_WORD_MASK = '*';
const MODAL_TIMEOUT = 300_000;

export async function playMiMaMu({ isLightning }: { isLightning?: boolean } = { isLightning: false }): Promise<void> {
    await resetDailyMiMaMuGuessCount();
    await resetDailyMiMaMuGuesses();

    const { MiMaMuNumber, dailyMiMaMuId: previousMiMaMuId } = { ...client };

    if (previousMiMaMuId) {
        const { answer: previousAnswer } = { ...await findMiMaMu({ id: previousMiMaMuId }) } as MiMaMuModel;

        await client.mimamuChannel.send({ content: `MiMaMu #${MiMaMuNumber - 1}'s answer:\n${format(previousAnswer, { bold: true })}` });
    }

    const { id, answer, prompt, author } = isLightning ?
        { ...await getLatest() } as MiMaMuModel :
        { ...await getRandom() } as MiMaMuModel;

    if (!id) {
        await client.mimamuChannel.send({ content: 'No MiMaMu prompts found in database.' });

        await setDailyMiMaMuId({ id: '' });
        return;
    }

    await setDailyMiMaMuId({ id });

    const guessBtn = new ButtonBuilder()
        .setCustomId(customIds.guessBtnId)
        .setLabel('Guess')
        .setStyle(ButtonStyle.Primary);

    const showPromptBtn = new ButtonBuilder()
        .setCustomId(customIds.showPromptBtnId)
        .setLabel('Show Prompt')
        .setStyle(ButtonStyle.Secondary);

    const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(guessBtn, showPromptBtn);

    const folderName = join(FileBasePaths.MiMaMu, id);

    const imgFileName = exists(getFilePath(folderName, 'upscale.png')) ? 'upscale.png' : 'imagine.png';

    const imgPath = getFilePath(folderName, imgFileName);

    const file = new AttachmentBuilder(imgPath);

    const title = `MiMaMu #${MiMaMuNumber}`;

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(getDisplayPrompt({ prompt, answer }))
        .setFooter({ text: `prompt by ${author}` })
        .setImage(`attachment://${imgFileName}`);

    const thread = await client.mimamuChannel.threads.create({
        name: title
    });

    await thread.send({ embeds: [embed], files: [file], components: [btnRow] });

    client.mimamuRole.members.forEach(async x => await thread.members.add(x.id));

    await deactivate({ id });
    await incrementMiMaMuNumber();
}

export async function guessMiMaMu({ userId, guess }: { userId: string, guess: string }): Promise<string> {
    const { dailyMiMaMuId, MiMaMuNumber } = { ...client };

    if (!dailyMiMaMuId) return 'Today\'s MiMaMu has not been found! Try again tomorrow.';

    const { dailyMiMaMuGuess, dailyMiMaMuGuessCount } = { ...await findUser(userId) } as UserModel;

    const { prompt, answer } = { ...await findMiMaMu({ id: dailyMiMaMuId }) } as MiMaMuModel;

    const pastAnswers = !dailyMiMaMuGuess ? [] : dailyMiMaMuGuess.split(';');

    const hiddenWords = getHiddenWordsArray({ prompt, answer });

    const guessArr = guess.split(' ').map(x => removePunctuation(x).trim().toLowerCase());

    const wordsLeft = [...hiddenWords].filter(x => !pastAnswers.includes(x));
    if (wordsLeft.length === 0) return 'You already won! Play again tomorrow!';

    const newlyFound = new Set<string>();
    for (const guessed of guessArr) {
        if (wordsLeft.includes(guessed)) newlyFound.add(guessed);
    }

    const updatedGuesses = new Set([...pastAnswers, ...newlyFound]);
    await updateLatestMiMaMuGuess({ id: userId, guess: [...updatedGuesses].join(';') });

    await incrementDailyMiMaMuGuessCount({ id: userId });

    const currentUserPrompt = getUpdatedUserPrompt({ prompt, answer, guesses: [...updatedGuesses] });

    const won = (newlyFound.size === wordsLeft.length &&
        [...newlyFound].every(x => wordsLeft.includes(x)));

    if (won) {
        const incrementedGuessCount = dailyMiMaMuGuessCount + 1;
        const isGuessPlural = incrementedGuessCount > 1;
        await client.mimamuChannel.send({ content: `${at(userId)} solved MiMaMu #${MiMaMuNumber - 1} in ${incrementedGuessCount} ${isGuessPlural ? 'guesses' : 'guess'}!` });
    }

    return won ?
        `You solved today's MiMaMu! The full prompt was:\n${format(currentUserPrompt, { bold: true })}` :
        `Your current prompt is:\n${format(currentUserPrompt, { bold: true })}`
}

export async function deleteDeactivatedImages(): Promise<void> {
    const activeIds = (await findAllMiMaMus({})).map(x => x.id);

    const entries = await readDir(MIMAMU_BASE_PATH);

    const toDelete = entries.filter(x => x.isDirectory() && !activeIds.includes(x.name));

    if (toDelete.length === 0) {
        logger.info('No Mimamu images were deleted')
        return;
    }

    for (const entry of toDelete) {
        try {
            const path = join(entry.path, entry.name);
            deleteDir(path);
            logger.info(`Deleted MiMaMu images for ${entry.name}`)
        } catch (error) {
            logger.error(`Failed to delete MiMaMu file: ${entry.name}`)
            logger.error(error);
        }
    }
}

export async function addMiMaMuPrompt({ interaction, answer, options }: { interaction: ChatInputCommandInteraction, answer: string, options: MiMaMuOptions }): Promise<void> {
    const allowed = await isCreationAllowed();

    if (!allowed) {
        await interaction.reply({ content: 'The server\'s prompt limit has been reached. Try again tomorrow!', flags: MessageFlags.Ephemeral });
        return;
    }

    await interaction.reply({ content: 'Your request has been accepted. You will receive a DM to complete your prompt shortly.', flags: MessageFlags.Ephemeral });

    if (options.style === MiMaMuStyles.DALLE3) {
        await imagineDallE({ answer, user: interaction.user });
    } else {
        await imagine({ answer, user: interaction.user, options });
    }
}

async function imagineDallE({ answer, user }: { answer: string, user: User }): Promise<void> {
    const images: OpenAI.Images.Image[] = [];
    for (const _ of [...Array(3).keys()]) {
        const n = 1;
        const img = await generateImage({ prompt: answer, n });

        if (!img.error && img.data.length === n) images.push(img.data[0]);
        else {
            await client.users.send(user.id, img.error);
            return;
        }
    }

    const selectABtn = new ButtonBuilder()
        .setCustomId('select-image-a')
        .setStyle(ButtonStyle.Secondary)
        .setLabel('A')

    const selectBBtn = new ButtonBuilder()
        .setCustomId('select-image-b')
        .setStyle(ButtonStyle.Secondary)
        .setLabel('B')

    const selectCBtn = new ButtonBuilder()
        .setCustomId('select-image-c')
        .setStyle(ButtonStyle.Secondary)
        .setLabel('C')

    const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents([selectABtn, selectBBtn, selectCBtn]);

    const embedA = new EmbedBuilder()
        .setTitle('Option A')
        .setImage(images[0].url)
        .setFooter({ text: images[0].revised_prompt });

    const embedB = new EmbedBuilder()
        .setTitle('Option B')
        .setImage(images[1].url)
        .setFooter({ text: images[1].revised_prompt });

    const embedC = new EmbedBuilder()
        .setTitle('Option C')
        .setImage(images[2].url)
        .setFooter({ text: images[2].revised_prompt });

    const msg = await client.users.send(user.id, { embeds: [embedA, embedB, embedC], components: [btnRow] });

    const collector = msg.createMessageComponentCollector({ filter: (u) => u.user.id === user.id });

    collector.on('collect', async (collectedInteraction) => {
        const modal = MiMaMuPromptModal(answer);
        collectedInteraction.showModal(modal);

        const filter = (cld) => cld.customId === customIds.promptModalId;
        collectedInteraction.awaitModalSubmit({ filter, time: MODAL_TIMEOUT })
            .then(async submitInteraction => {
                const fields = submitInteraction.fields;
                const imgSelected = collectedInteraction.customId.split('-').pop().toUpperCase();
                const prompt = fields.getTextInputValue(customIds.promptCreateId);
                const id = uuid();

                const result = await handlePromptModalSubmit({ id, answer, prompt, author: user.username });

                if (result.success) {
                    collector.stop();

                    selectABtn.setDisabled(true);
                    selectBBtn.setDisabled(true);
                    selectCBtn.setDisabled(true);

                    collectedInteraction.editReply({ embeds: [embedA, embedB, embedC], components: [btnRow] });

                    let imgToSave = '';
                    switch (imgSelected) {
                        case 'A':
                            imgToSave = images[0].url;
                            break;
                        case 'B':
                            imgToSave = images[1].url;
                            break;
                        case 'C':
                            imgToSave = images[2].url;
                            break;
                    }

                    mkdir(join(MIMAMU_BASE_PATH, id));
                    await saveWebFile({ url: imgToSave, path: join(MIMAMU_BASE_PATH, id, 'upscale.png') });
                }
                await submitInteraction.reply(result.msg);
            })
            .catch(err => logger.error(err));
    });

}

export async function handlePromptModalSubmit({ id, answer, prompt, author }:
    { id: string, answer: string, prompt: string, author: string }):
    Promise<{ success: boolean, msg: string }> {
    const splitPrompt = prompt.split(' ').filter(x => x !== '');
    const splitAnswer = answer.split(' ').filter(x => x !== '');
    const errors: string[] = [];

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

    const isValidPrompt = errors.length === 0;

    if (!isValidPrompt) {
        errors.unshift(format('Errors found:', { bold: true }));
        return {
            success: false,
            msg: errors.join('\n- ')
        };
    }
    else {
        const isCreateSuccess = await create({ id, answer, prompt, author });

        if (!isCreateSuccess) {
            return {
                success: false,
                msg: 'Prompt creation failed. Prompt limit may have been reached.'
            };
        }

        return {
            success: true,
            msg: 'Your submission was received successfully!'
        };
    }
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

export async function getPromptsByAuthor({ author }: { author: string }): Promise<MiMaMuModel[]> {
    return await findByAuthor({ author });
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
            const hiddenWordLengthText = format(`(${hiddenWordLength})`, { bold: true });

            const underscores = `${hiddenLetter.repeat(hiddenWordLength)}${hiddenWordLengthText}`
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

export async function handleGuessBtn(interaction: ButtonInteraction) {
    const modal = MiMaMuGuessModal();
    interaction.showModal(modal);

    const TWENTY_FOUR_HOURS = 8.64e7;

    const submitted: ModalSubmitInteraction = await interaction.awaitModalSubmit({
        time: TWENTY_FOUR_HOURS,
        filter: i => i.user.id === interaction.user.id,
    }).catch(error => {
        logger.error(error);
        return null;
    })

    if (submitted) {
        await submitted.deferUpdate();

        const guess = submitted.fields.getTextInputValue(customIds.guessInputId);

        const response = await guessMiMaMu({ userId: interaction.user.id, guess });

        interaction.followUp({ content: response, flags: MessageFlags.Ephemeral });
    }
}

export async function handleShowPromptBtn(interaction: ButtonInteraction) {
    const id = interaction.user.id;

    const { dailyMiMaMuGuess } = { ...await findUser(id) } as UserModel;

    if (typeof (dailyMiMaMuGuess) !== "string") return;

    const { prompt, answer } = { ...await findMiMaMu({ id: client.dailyMiMaMuId }) } as MiMaMuModel;

    if (!prompt || !answer) return;

    const pastAnswers = !dailyMiMaMuGuess ? [] : dailyMiMaMuGuess.split(';');

    const currentUserPrompt = getUpdatedUserPrompt({ prompt, answer, guesses: pastAnswers });

    interaction.reply({ content: format(currentUserPrompt, { bold: true }), flags: MessageFlags.Ephemeral });
}
