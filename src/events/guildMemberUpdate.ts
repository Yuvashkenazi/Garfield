import { Events } from 'discord.js';
import { Event, GuildMemberUpdateParams, } from '../types/Event.js';
import { addNickname } from '../repository/NicknameRepo.js';
import { logger } from '../utils/LoggingHelper.js';

export const event: Event = {
    name: Events.GuildMemberUpdate,
    once: false,
    async execute({ client, oldMember, newMember }: GuildMemberUpdateParams): Promise<void> {
        if (!newMember.id || !newMember.nickname) return;

        await addNickname({ userId: newMember.id, nickname: newMember.nickname });
    },
};
