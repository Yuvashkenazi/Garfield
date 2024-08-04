import { User } from 'discord.js';
import {
    findAll as _getAll,
    find as _find,
    newUsersCheck as _newUsersCheck,
    updateMastermindData as _updateMastermindData,
    resetDailyMiMaMuGuessCount as _resetDailyMiMaMuGuessCount,
    resetDailyMiMaMuGuesses as _resetDailyMiMaMuGuesses,
    incrementDailyMiMaMuGuessCount as _incrementDailyMiMaMuGuessCount,
    updateLatestMiMaMuGuess as _updateLatestMiMaMuGuess,
    setBirthday as _setBirthday
} from '../repository/UserRepo.js'

export async function getAll() {
    return await _getAll({ orderBy: 'username' });
}

export async function find(id: string) {
    return await _find(id);
}

export async function newUsersCheck(users: User[]) {
    return await _newUsersCheck(users);
}

export async function updateMastermindData({ id, gameStarted, answer, attempts }:
    { id: string, gameStarted: boolean, answer: string, attempts: number }) {
    return await _updateMastermindData({ id, gameStarted, answer, attempts });
}

export async function resetDailyMiMaMuGuessCount() {
    return await _resetDailyMiMaMuGuessCount();
}

export async function resetDailyMiMaMuGuesses() {
    return await _resetDailyMiMaMuGuesses();
}

export async function incrementDailyMiMaMuGuessCount({ id }: { id: string }) {
    return await _incrementDailyMiMaMuGuessCount({ id });
}

export async function updateLatestMiMaMuGuess({ id, guess }: { id: string, guess: string }) {
    return await _updateLatestMiMaMuGuess({ id, guess });
}

export async function setBirthday({ id, birthday }: { id: string, birthday: Date }) {
    return await _setBirthday({ id, birthday: birthday.valueOf() });
}
