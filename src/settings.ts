import _config from '../config.testing.json';
// import _config from '../config.json';

export interface Config {
    clientId: string;
    guildId: string;
    token: string;
    ProPublicaApiKey: string;
    TwitchClientId: string;
    TwitchAppAccessToken: string;
    GiphyApiKey: string;
    MusixMatchApiKey: string;
    OpenAIApiKey: string;
    theChannelID: string;
    theSpamChannelID: string;
    musicalChannelID: string;
    mangaChannelID: string;
    theComicChannelID: string;
    mimamuChannelId: string;
}
export const config = _config as Config;

export const channelIds = new Map<string, string>([
    ['theChannelID', config.theChannelID],
    ['theSpamChannelID', config.theSpamChannelID],
    ['musicalChannelID', config.musicalChannelID],
    ['mangaChannelID', config.mangaChannelID],
    ['theComicChannelID', config.theComicChannelID],
    ['mimamuChannelId', config.mimamuChannelId],
]);