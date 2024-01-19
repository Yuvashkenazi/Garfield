import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { Command } from "../types/Command.js";
import { find, updateMastermindData } from "../services/UserService.js";
import { getRandomInteger } from "../utils/Common.js";
import { UserModel } from "../models/UserModel.js";

interface MasterMindResults {
    black: number;
    white: number;
    attempts?: number;
}

async function startMastermind(userId: string): Promise<void> {
    const { gameStarted } = { ...await find(userId) } as UserModel;

    if (!gameStarted) {
        const randomized = _randomizeAnswer();

        await updateMastermindData({
            id: userId,
            gameStarted: true,
            answer: randomized,
            attempts: 0
        });
    }
}

async function guessMastermind(userId: string, guess: string): Promise<MasterMindResults> {
    const { answer, attempts } = { ...await find(userId) } as UserModel;

    await updateMastermindData({
        id: userId,
        gameStarted: true,
        answer: answer,
        attempts: attempts + 1
    });

    const guessArray = guess.split("");
    const answerArray = answer.split("");

    const processedGuess = _processGuess(guessArray, answerArray);

    processedGuess.attempts = attempts;

    if (processedGuess.black === 4) {
        await updateMastermindData({
            id: userId,
            gameStarted: false,
            answer: '',
            attempts: 0
        });
    }

    return processedGuess;
}

function _processGuess(guess: string[], answer: string[]): MasterMindResults {
    let black = 0;
    let white = 0;

    if (guess[0] === answer[0]) {
        black++;
    }
    if (guess[1] === answer[1]) {
        black++;
    }
    if (guess[2] === answer[2]) {
        black++;
    }
    if (guess[3] === answer[3]) {
        black++;
    }

    if (answer.includes(guess[0]) && guess[0] !== answer[0]) {
        white++;
    }
    if (answer.includes(guess[1]) && guess[1] !== answer[1]) {
        white++;
    }
    if (answer.includes(guess[2]) && guess[2] !== answer[2]) {
        white++;
    }
    if (answer.includes(guess[3]) && guess[3] !== answer[3]) {
        white++;
    }

    return {
        black,
        white
    };
}

function _stringifyResults(black: number, white: number): string {
    const blackCircle = ':black_circle:';
    const whiteCircle = ':white_circle:';

    let results = '';

    if (black !== 0) {
        for (let i = 0; i < black; i++) {
            results += `${blackCircle} `;
        }
    }

    if (white !== 0) {
        for (let j = 0; j < white; j++) {
            results += `${whiteCircle} `;
        }
    }

    return results;
}

function _randomizeAnswer() {
    let randomizeAnswer = '';
    const inAnswer = [];
    for (let i = 0; i < 4; i++) {
        let randNum = getRandomInteger({ min: 1, max: 6 });

        while (inAnswer.includes(randNum)) {
            randNum = getRandomInteger({ min: 1, max: 6 });
        }

        inAnswer.push(randNum);

        randNum.toString();
        randomizeAnswer += randNum;
    }
    return randomizeAnswer;
}

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('mastermind')
        .setDescription('Play a game of mastermind. The answer is a non-duplicate 4 digit code (1-6).')
        .addStringOption(option =>
            option.setName('guess')
                .setDescription('Enter a non-duplicate 4 digit code (1-6).')
                .setRequired(true)
                .setMinLength(4)
                .setMaxLength(4)
        ),
    async execute({ interaction }: { interaction: ChatInputCommandInteraction }) {
        const member = interaction.member;
        const userId = member.user.id;

        await interaction.deferReply();

        await startMastermind(userId);

        const guess = interaction.options.getString('guess');

        const resultObj = await guessMastermind(userId, guess);

        if (resultObj.black === 0 && resultObj.white === 0) {
            interaction.editReply('You\'re waaay off, loser!');
            return;
        }

        const results = _stringifyResults(
            resultObj.black,
            resultObj.white
        );

        const embed = new EmbedBuilder()
            .setTitle('Mastermind')
            .setAuthor({ name: member.user.username, iconURL: member.avatar })
            .addFields([
                { name: 'You guessed', value: guess, inline: true },
                { name: 'Response', value: results, inline: true },
            ]);

        if (resultObj.black === 4) {
            embed.setDescription(`
You win! You must not be a loser after all.
It took you ${resultObj.attempts} attempts.
            `);
        }

        interaction.editReply({ embeds: [embed] });
    }
};