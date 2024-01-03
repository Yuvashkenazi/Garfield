import { BaseInteraction, Client, ClientOptions, Collection, GuildMember, Message, TextChannel } from 'discord.js';
import { Config } from '../index.js';
import { Command } from '../types/Command.js';
import { Event } from '../types/Event.js';
import { FileBasePaths } from '../constants/FileBasepaths.js';
import { loadFiles } from '../repository/FileRepo.js';
import { SettingsModel } from '../models/index.js';

export class CustomClient extends Client implements SettingsModel {
    events: Collection<string, (arg: Message | BaseInteraction) => Promise<void>>;
    commands: Collection<string, Command>;

    ProPublicaApiKey: string;
    TwitchClientId: string;
    TwitchAppAccessToken: string;
    GiphyApiKey: string;
    MusixMatchApiKey: string;
    OpenAIApiKey: string;

    isMangaOn: boolean;
    isMiMaMuOn: boolean;
    isMorningSongsOn: boolean;
    isVoteOn: boolean;
    wordRate: string;
    reactionRate: string;
    comic1: string;
    comic2: string;
    voteStartTime: string;
    MiMaMuStartTime: string;
    MiMaMuNumber: number;
    dailyMiMaMuId: string;

    theChannel: TextChannel;
    theSpamChannel: TextChannel;
    musicalChannel: TextChannel;
    mangaChannel: TextChannel;
    theComicChannel: TextChannel;
    mimamuChannel: TextChannel;

    ChatTheme: string;

    constructor(clientOptions: ClientOptions) {
        super(clientOptions);
    }

    async loadCommands() {
        const commandFiles = loadFiles(FileBasePaths.Commands);

        for (const file of commandFiles) {
            const { command } = require(file) as { command: Command };

            this.commands.set(command.data.name, command);
        }
    }

    async loadEvents() {
        const eventFiles = loadFiles(FileBasePaths.Events);

        for (const file of eventFiles) {
            const { event } = require(file) as { event: Event };

            type EventData =
                | Message
                | BaseInteraction
                | GuildMember;

            const execute = (...arg: EventData[]) => event.execute({
                client: this,
                ...(arg[0] instanceof Message ? { message: arg[0] } : {}),
                ...(arg[0] instanceof BaseInteraction ? { interaction: arg[0] } : {}),
                ...(Array.isArray(arg) && arg.length === 2 && arg.every(m => m instanceof GuildMember) ? { oldMember: arg[0], newMember: arg[1] } : {}),
            });

            if (event.once) {
                this.once(event.name, execute);
            }
            else {
                this.on(event.name, execute);
            }

            this.events.set(event.name, execute);
        }
    }

    setSettings(settings: SettingsModel) {
        this.isMangaOn = settings.isMangaOn;
        this.isMiMaMuOn = settings.isMiMaMuOn;
        this.isMorningSongsOn = settings.isMorningSongsOn;
        this.isVoteOn = settings.isVoteOn;
        this.wordRate = settings.wordRate;
        this.reactionRate = settings.reactionRate;
        this.voteStartTime = settings.voteStartTime;
        this.MiMaMuStartTime = settings.MiMaMuStartTime;
        this.MiMaMuNumber = settings.MiMaMuNumber;
        this.dailyMiMaMuId = settings.dailyMiMaMuId;
    }

    //this has to happen BEFORE commands get loaded in
    async loadConfig(config: Config): Promise<void> {
        this.ProPublicaApiKey = config.ProPublicaApiKey;
        this.TwitchClientId = config.TwitchClientId;
        this.TwitchAppAccessToken = config.TwitchAppAccessToken;
        this.GiphyApiKey = config.GiphyApiKey;
        this.MusixMatchApiKey = config.MusixMatchApiKey;
        this.OpenAIApiKey = config.OpenAIApiKey;
    }

    //this has to happen AFTER client ready event is emitted (logged in successfully)
    loadChannels(channelIds: Map<string, string>) {
        channelIds.forEach((value, key) => this[key] = this.channels.cache.get(value));
    }
}
