import { Event, ClientReadyParams } from '../types/Event.js';
import { Events } from "discord.js";
import { channelIds, roleIds } from '../index.js';
import { getSettings, getGuildMemebers } from '../services/SettingsService.js';
import { initDB } from "../repository/DatabaseRepo.js";
import { initCheck } from "../repository/WordRepo.js";
import { newUsersCheck } from "../services/UserService.js";
import { restartInterval } from "../services/IntervalService.js";
import { getVotes } from '../repository/VotesRepo.js';
import { logger } from "../utils/LoggingHelper.js";

export const event: Event = {
    name: Events.ClientReady,
    once: true,
    async execute({ client }: ClientReadyParams): Promise<void> {
        await initDB();

        await initCheck();

        const members = await getGuildMemebers();

        const users = members.map(x => x.user);

        await newUsersCheck(users);

        const settings = await getSettings();
        settings && client.setSettings(settings);

        const vote = await getVotes();
        vote && client.setVote(vote);

        client.loadChannels(channelIds);
        client.loadRoles(roleIds);

        restartInterval();

        logger.info('Ready!');
    },
};
