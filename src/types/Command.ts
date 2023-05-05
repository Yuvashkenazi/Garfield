import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CustomClient } from '../extensions/CustomClient.js';

interface CommandParams {
    interaction: ChatInputCommandInteraction;
    client: CustomClient;
}

export interface Command {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    execute: (params: CommandParams) => Promise<void>;
}
