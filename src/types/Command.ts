import { ChatInputCommandInteraction, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { CustomClient } from '../extensions/CustomClient.js';

interface CommandParams {
    interaction: ChatInputCommandInteraction;
    client: CustomClient;
}

export interface Command {
    data: SlashCommandOptionsOnlyBuilder;
    execute: (params: CommandParams) => Promise<void>;
    helpMsg?: string;
}
