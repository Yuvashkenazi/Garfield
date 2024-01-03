import { Event, ClientReadyParams } from '../types/Event.js';
import { Events } from "discord.js";
import { channelIds } from '../index.js';
import { getSettings, getGuildMemebers } from '../services/SettingsService.js';
import { initDB } from "../repository/DatabaseRepo.js";
import { initCheck } from "../repository/WordRepo.js";
import { newUsersCheck } from "../repository/UserRepo.js";
import { restartInterval } from "../services/IntervalService.js";
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
        client.loadChannels(channelIds);

        restartInterval();

        logger.info('Ready!');
    },
};
