import { client } from '../index.js';
import { Message, TextChannel } from 'discord.js';
import { getList, addWord } from "../repository/WordRepo.js";
import { getRandomInteger } from "../utils/Common.js";
import { WordRate } from "../constants/WordRate.js";
import { ReactionRate } from "../constants/ReactionRate.js";

//sentences are constructed by repeatedly rolling a number between 0 and 1 and adding a word each time, until the number rolled is greater than NEXT_WORD_CHANCE
const NEXT_WORD_CHANCE = 0.89;
const MESSAGE_LENGTH_LIMIT = 2000;

//every minute has 1 over [rate] chance of sending a message. fast will send a message every minute
const WORD_RATE_SLOW = 1440;
const WORD_RATE_NORMAL = 30;
const WORD_RATE_FAST = 1;

//the chance for a message from a human to receive a reaction from the bot
const REACTION_RATE_SLOW = 0.03;
const REACTION_RATE_NORMAL = 0.25;

const EMOJIS = ['👍', '💯', '🤣', '😉', '🙃', '🤢', '🤬', '🖕', '😲', '🤔', '🥺', '💀', '🇬🇧'];

const CUSTOM_EMOJIS = [
    '1052770092997427270', //lksquare
    '658032150511222785', //BIG
    '1351700364415602739', //ICANT
    '658030100935213057', //SDFU
    '919602162722537523', //RikaPog
    '658032149789671444', //barf
    '760973879430348881', //chuck
    '648264710025642015', //cooldude
    '648258411573542957', //druff
    '1269848644207640657', //f*ck
    '658032149852717066', //grimace
    '1234164085029994617', //hearingaids
    '671492933849055292', //kram2
    '671494053396742215', //kram3
    '658032150263758858', //lol
    '694359303720665154', //me
    '1269966754013253632', //me2
    '816770866431393802', //pog
    '489986970509115402', //sadman
    '489249475630727178', //scared
    '1269848938161246209', //sotrue
    '1269849090498367529', //what
    '658032150829858816', //yell
    '850930355686604840', //yuval
    '993559075575058472', //yuvalok
    '1096510664043929741', //yuvalok2
];

/*const CUSTOM_EMOJIS = client.emojis.cache
    .filter(x => CUSTOM_EMOJI_NAME_FILTER.includes(x.name))
    .map(x => x.toString());*/

const REACTIONS = [...EMOJIS, ...CUSTOM_EMOJIS];

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

function getReactionPostingRate(mode: string): number {
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

export function randomReactionToMsg(msg: Message, mode: string) {
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
    //get list of words, end function of list is empty
    let words = await getList();
    if (words.length === 0) {
        return;
    }

    words = words.filter(word => word !== '');

    //initialize sentence as a blank string
    let sentence = '';

    //have a chance of starting a message with a #, which will make the message text display larger within discord
    if(Math.random() < 0.25){
        sentence += '# ';
    }
    
    //always add at least one word to the sentence
    sentence += getRandomWord(words);

    while (!sentence) {
        sentence += getRandomWord(words);
    }

    //add 0 to 2 words to make very short messages less likely
    const supplement = (Math.floor(Math.random() * 3));
    for (let i = 0; i < supplement; i++) {
        sentence += getRandomWord(words);
    }

    //keep adding words until nextWordCheck fails or the sentence tries to become longer than 2000 characters
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

//supply NEXT_WORD_CHANCE to coinToss to determine if another word should be added to the sentence
function nextWordCheck(): boolean {
    return coinToss(NEXT_WORD_CHANCE);
}

//function that receives a number between 0 and 1 and compares if a random number is larger or smaller
function coinToss(chanceToPass: number): boolean {
    //if chance to pass is less than 0 or greater than 1, end immediately
    if (chanceToPass < 0 || chanceToPass > 1) {
        return false;
    }

    const roll = Math.random();

    return roll < chanceToPass;
}

function getRandomWord(words: string[]): string {

    let word = '';

    //find a non-empty word
    while (!word) {
        const rndIndx = getRandomInteger({ max: words.length - 1 });

        word = words[rndIndx];
    }

    //return the word with a space at the end
    return `${word} `;
}
