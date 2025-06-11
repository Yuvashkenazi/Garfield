import { client } from '../index.js';
import { Message, TextChannel } from 'discord.js';
import { getList, addWord } from "../repository/WordRepo.js";
import { getRandomInteger } from "../utils/Common.js";
import { WordRate } from "../constants/WordRate.js";
import { ReactionRate } from "../constants/ReactionRate.js";

const NEXT_WORD_CHANCE = 0.87;
const MESSAGE_LENGTH_LIMIT = 2000;

const WORD_RATE_SLOW = 1080;
const WORD_RATE_NORMAL = 30;
const WORD_RATE_FAST = 1;

const REACTION_RATE_SLOW = 0.03;
const REACTION_RATE_NORMAL = 0.25;

const EMOIJIS = ['👍', '💯', '🤣', '😉', '🙃', '🤢', '🤬', '🖕', '😲', '🤔', '🥺', '💀', '🇬🇧'];

const CUSTOM_EMOJI_NAME_FILTER = [
    'lksquare',
    'scared',
    'druff',
    'RikaPog',
    'cooldude',
    'lol',
    'me',
    'pog',
    'sadman',
    'yell',
    'yuvalok',
    'chuck',
    'trumpyell',
    'me2',
    'sotrue',
    'fuck',
    'what'
];

const CUSTOM_EMOJIS = client.emojis.cache
    .filter(x => CUSTOM_EMOJI_NAME_FILTER.includes(x.name))
    .map(x => x.toString());

const REACTIONS = [...EMOIJIS, ...CUSTOM_EMOJIS];

function getWordPostingRate(mode: string): number {
    console.log(mode);
    switch (mode) {
        case WordRate.NORMAL:
            return WORD_RATE_NORMAL;
        case WordRate.FAST:
            return WORD_RATE_FAST;
        case WordRate.SLOW:
        default:
            return WORD_RATE_SLOW;
    }
}

function getReactionPostingRate(mode: ReactionRate): number {
    switch (mode) {
        case ReactionRate.NORMAL:
            return REACTION_RATE_NORMAL;
        case ReactionRate.RANDOM:
            return Math.random();
        case ReactionRate.SLOW:
        default:
            return REACTION_RATE_SLOW;
    }
}

const getRandomReaction = (): string => REACTIONS[Math.floor(Math.random() * REACTIONS.length)];

export function randomReactionToMsg(msg: Message, mode: ReactionRate) {
    const reaction = getRandomReaction();

    if (mode === ReactionRate.FAST) {
        msg.react(reaction);
        return;
    }

    const rate = getReactionPostingRate(mode);
    if (coinToss(rate))
        msg.react(reaction);
}

export async function sendWord(ch: TextChannel): Promise<void> {
    const rate = getWordPostingRate(client.wordRate);

    if (!rate || !postCheck(rate)) {
        return;
    }

    const sentence = await generateSentence();

    if (!sentence) {
        return;
    }

    ch.send(sentence);
}

export async function addMessage(msg: string): Promise<void> {
    const words = msg.split(' ');

    for (const word of words) {
        await addWord(word);
    }
}

export async function generateSentence(): Promise<string> {
    let words = await getList();

    if (words.length === 0) {
        return;
    }

    words = words.filter(word => word !== '');

    let sentence = '';

    sentence += getRandomWord(words);

    while (!sentence) {
        sentence += getRandomWord(words);
    }

    //const supplement = (Math.floor(Math.random()*2)) + (Math.floor(Math.random()*2)) + (Math.floor(Math.random()*2));
    const supplement = (Math.floor(Math.random() * 3));

    for (let i = 0; i < supplement; i++) {
        sentence += getRandomWord(words);
    }

    while (nextWordCheck()) {
        const wordToAdd = getRandomWord(words);

        if (sentence.length + wordToAdd.length > MESSAGE_LENGTH_LIMIT) {
            break;
        }

        sentence += wordToAdd;
    }
    return sentence;
}

function postCheck(rate: number): boolean {
    const postingRate = 1 / rate;

    return coinToss(postingRate);
}

function nextWordCheck(): boolean {
    return coinToss(NEXT_WORD_CHANCE);
}

function coinToss(chanceToPass: number): boolean {
    if (chanceToPass < 0 || chanceToPass > 1) {
        return false;
    }

    const roll = Math.random();

    return roll < chanceToPass;
}

function getRandomWord(words: string[]): string {

    let word = '';

    while (!word) {
        const rndIndx = getRandomInteger({ max: words.length - 1 });

        word = words[rndIndx];
    }

    return `${word} `;
}
