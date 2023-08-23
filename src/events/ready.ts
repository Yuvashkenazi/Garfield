import { Event, ClientReadyParams } from '../types/Event.js';
import { Events } from "discord.js";
import { getSettings } from "../repository/SettingsRepo.js";
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

        const [guild] = client.guilds.cache.values();

        const members = await guild.members.fetch();

        const users = members.map(x => x.user);

        await newUsersCheck(users);

        const settings = await getSettings();

        settings && client.setSettings(settings);

        restartInterval();

        logger.info('Ready!');
    },
};
