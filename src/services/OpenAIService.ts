import { config } from "../settings.js";
import { Configuration, OpenAIApi, ImagesResponse } from "openai";
import { logger } from "../utils/LoggingHelper.js";

const { OpenAIApiKey } = config;

const configuration = new Configuration({ apiKey: OpenAIApiKey });
const openai = new OpenAIApi(configuration);

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
