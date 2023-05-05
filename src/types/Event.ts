import { Message, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { CustomClient } from '../extensions/CustomClient.js';

interface BaseEventParams { client: CustomClient }
export interface ClientReadyParams extends BaseEventParams { };
export interface MessageCreateParams extends BaseEventParams { message: Message };
export interface InteractionCreateParams extends BaseEventParams { interaction: ChatInputCommandInteraction };
export interface GuildMemberUpdateParams extends BaseEventParams { oldMember: GuildMember, newMember: GuildMember };

export interface Event {
    name: string;
    once: boolean;
    execute: (params:
        ClientReadyParams |
        MessageCreateParams |
        InteractionCreateParams |
        GuildMemberUpdateParams
    ) => Promise<void>;
}
