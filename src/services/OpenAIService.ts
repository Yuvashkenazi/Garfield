import { GuildTextBasedChannel } from 'discord.js';
import { client } from "../index.js";
import OpenAI from "openai";
import { at, paginate } from '../utils/Common.js';
import { logger } from "../utils/LoggingHelper.js";

const { OpenAIApiKey } = client;

const openai = new OpenAI({
    apiKey: OpenAIApiKey ?? '0'
});

export async function chat({ userId, channel, message, wordsToUse }: {
    userId: string,
    channel: GuildTextBasedChannel,
    message: string,
    wordsToUse: string
}): Promise<void> {
    const identity = `${client.ChatTheme}
    Try to fit the following into your replies:
    ${wordsToUse}
    `;

    const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            { role: 'system', content: identity },
            { role: 'user', content: message }
        ]
    })
        .catch(err => console.error(err));

    if (!chatCompletion || chatCompletion.choices.length === 0) {
        logger.error('Response could not be generated');
        return;
    }

    let response = chatCompletion.choices[0].message.content;

    const paginated = paginate(response);

    for (const page of paginated) {
        channel.send(page);
    }
}

export async function generateImage({ prompt, n }: { prompt: string, n: number }): Promise<OpenAI.Images.ImagesResponse & { error: string }> {
    let error = '';
    const response = await openai.images.generate({
        model: 'dall-e-3',
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
        data: response.data ?? [],
        error,
        created: 0
    };
}
