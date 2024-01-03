import { client } from '../index.js';
import { Collection, GuildMember } from 'discord.js';
import {
    getSettings as _getSettings,
    setWordRate as _setWordRate,
    setReactionRate as _setReactionRate,
    toggleManga as _toggleManga,
    toggleVote as _toggleVote,
    toggleMiMaMu as _toggleMiMaMu,
    toggleMorningSongs as _toggleMorningSongs,
    setDailyMiMaMuId as _setDailyMiMaMuId,
    incrementMiMaMuNumber as _incrementMiMaMuNumber,
    setChatTheme as _setChatTheme
} from '../repository/SettingsRepo.js'
import { WordRate } from "../constants/WordRate.js";
import { ReactionRate } from '../constants/ReactionRate.js';

export async function getSettings() {
    return await _getSettings();
}

export async function getGuildMemebers(): Promise<Collection<string, GuildMember>> {
    const [guild] = client.guilds.cache.values();

    return await guild.members.fetch();
}

export async function setWordRate({ rate }: { rate: WordRate }) {
    await _setWordRate(rate);
    client.wordRate = rate;
}

export async function setReactionRate({ rate }: { rate: ReactionRate }) {
    await _setReactionRate(rate);
    client.reactionRate = rate;
}

export async function toggleManga(): Promise<boolean> {
    const isMangaOn = await _toggleManga();
    client.isMangaOn = isMangaOn;
    return isMangaOn;
}

export async function toggleVote(): Promise<boolean> {
    const isVoteOn = await _toggleVote();
    client.isVoteOn = isVoteOn;
    return isVoteOn;
}

export async function toggleMiMaMu(): Promise<boolean> {
    const isMiMaMuOn = await _toggleMiMaMu();
    client.isMiMaMuOn = isMiMaMuOn;
    return isMiMaMuOn;
}

export async function toggleMorningSongs(): Promise<boolean> {
    const isMorningSongsOn = await _toggleMorningSongs();
    client.isMorningSongsOn = isMorningSongsOn;
    return isMorningSongsOn;
}

export async function setDailyMiMaMuId({ id }: { id: string }) {
    await _setDailyMiMaMuId({ id });
    client.dailyMiMaMuId = id;
}

export async function incrementMiMaMuNumber() {
    await _incrementMiMaMuNumber();
    client.MiMaMuNumber++;
}

export async function setChatTheme({ theme }: { theme: string }) {
    await _setChatTheme({ theme });
    client.ChatTheme = theme;
}
