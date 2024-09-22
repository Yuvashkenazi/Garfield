import { GuildTextBasedChannel } from 'discord.js';
import { client } from "../index.js";
import OpenAI from "openai";
import { at, paginate } from '../utils/Common.js';
import { logger } from "../utils/LoggingHelper.js";
import { ChatCompletionContentPart } from 'openai/resources/chat/completions.js';

const { OpenAIApiKey } = client;

const openai = new OpenAI({
    apiKey: OpenAIApiKey ?? '0'
});

export async function chat({ userId, channel, message, wordsToUse, imageUrl = '' }: {
    userId: string,
    channel: GuildTextBasedChannel,
    message: string,
    wordsToUse: string,
    imageUrl?: string
}): Promise<void> {
    const identity = `${client.ChatTheme ?? ''}
    Do not repeat your identity in your responses.
    You must fit the following space-separated words and links into your response, work them in to the sentence naturally, use them all even if they are nonsensical:
    ${wordsToUse}
    `;

    const content: ChatCompletionContentPart[] = [{ type: 'text', text: message }];

    if (!!imageUrl) {
        const imageObj: ChatCompletionContentPart = { type: 'image_url', image_url: { url: imageUrl } };
        content.push(imageObj);
    }

    const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: identity },
            { role: 'user', content }
        ]
    })
        .catch(err => console.error(err));

    if (!chatCompletion || chatCompletion.choices.length === 0) {
        logger.error('Response could not be generated');
        return;
    }

    let response = chatCompletion.choices[0].message.content;

    const paginated = paginate(response);

    for (const [indx, page] of paginated.entries()) {
        await channel.send(indx === 0 ? `${at(userId)} ${page}` : page);
    }
}

export async function generateImage({ prompt, n }: { prompt: string, n: number }): Promise<OpenAI.Images.ImagesResponse & { error: string }> {
    let errorMsg = '';
    const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n,
        size: "1024x1024"
    }).catch((error) => {

        if (error instanceof OpenAI.APIError) {
            logger.error(error.status);  // e.g. 401
            logger.error(error.message); // e.g. The authentication token you passed was invalid...
            logger.error(error.code);  // e.g. 'invalid_api_key'
            console.error(error.type);  // e.g. 'invalid_request_error'

            errorMsg = error.message;
        } else {
            logger.error(error);
            errorMsg = error;
        }
    });

    return !response ? {
        data: [],
        error: errorMsg,
        created: 0
    } : {
        data: response.data ?? [],
        error: errorMsg,
        created: 0
    };
}
