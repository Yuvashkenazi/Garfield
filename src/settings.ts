import _config from '../config.json';
// import _config from '../config.testing.json';

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
    ['theChannel', config.theChannelID],
    ['theSpamChannel', config.theSpamChannelID],
    ['musicalChannel', config.musicalChannelID],
    ['mangaChannel', config.mangaChannelID],
    ['theComicChannel', config.theComicChannelID],
    ['mimamuChannel', config.mimamuChannelId],
]);
