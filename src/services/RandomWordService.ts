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
const REACTIONS = ['👍', '💯', '🤣', '😉', '🙃', '🤢', '🤬', '🖕', '😲', '🤔', '🥺', '💀', '🇬🇧',
    '<:lksquare:1052770092997427270>',
    '<:scared:489249475630727178>',
    '<:druff:648258411573542957>',
    '<:RikaPog:919602162722537523>',
    '<:cooldude:648264710025642015> ',
    '<:lol:658032150263758858> ',
    '<:me:694359303720665154> ',
    '<:pog:816770866431393802>',
    '<:sadman:489986970509115402>',
    '<:yell:658032150829858816>',
    '<:yuvalok:993559075575058472>',
    '<:chuck:760973879430348881>',
    '<:trumpyell:658032150683189269>',
];

function getWordPostingRate(mode: WordRate): number {
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

export async function sendWord(ch: TextChannel, mode: WordRate): Promise<void> {
    const rate = getWordPostingRate(mode);

    if (!rate || !postCheck(rate)) {
        return;
    }

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
