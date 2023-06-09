import { GuildTextBasedChannel } from 'discord.js';
import { config } from "../settings.js";
import { Configuration, OpenAIApi, ImagesResponse } from "openai";
import { at } from '../utils/Common.js';
import { logger } from "../utils/LoggingHelper.js";

const { OpenAIApiKey } = config;

const configuration = new Configuration({ apiKey: OpenAIApiKey });
const openai = new OpenAIApi(configuration);

export async function chat({ userId, channel, message, wordsToUse }: {
    userId: string,
    channel: GuildTextBasedChannel,
    message: string,
    wordsToUse: string
}): Promise<void> {
    const content = `
You're the wild and crazy wisecracking cat, Garfield.
Respond to this message:
"${message}"
Using these words:
"${wordsToUse}"
`;

    const chatCompletion = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [{ role: 'user', content }]
    })
        .catch(err => console.error(err));

    if (!chatCompletion || chatCompletion.status !== 200 || chatCompletion.data.choices.length === 0) {
        logger.error('Response could not be generated');
        return;
    }

    channel.send(`${at(userId)} ${chatCompletion.data.choices[0].message.content}`);
}

export async function generateImage({ prompt, n }: { prompt: string, n: number }): Promise<ImagesResponse & { error: string }> {
    let error = '';
    const response = await openai.createImage({
        prompt,
        n,
        size: "1024x1024"
    }).catch(err => {
        error = err.response?.data?.error?.message ?? err.response?.statusText;
        logger.error(error);
    });

    return !response ? {
        data: [],
        error: error,
        created: 0
    } : {
        data: response.data?.data ?? [],
        error: response.status !== 200 ? error : '',
        created: 0
    };
}
