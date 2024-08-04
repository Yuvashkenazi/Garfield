import { client } from "../index.js";
import giphy from "giphy-api";
import { logger } from "../utils/LoggingHelper.js";

export async function randomGif(): Promise<string> {
    return giphy(client.GiphyApiKey)
        .random('')
        .then(res => {
            return res.data.embed_url;
        })
        .catch(error => logger.error(error));
}

export async function searchGif(query: string): Promise<string> {
    return giphy(client.GiphyApiKey)
        .search({ q: query, limit: 10 })
        .then(res => {
            if (res.data) {
                const numOfResults = res.data.length;
                if (numOfResults > 0) {
                    const randNum = Math.floor(Math.random() * numOfResults);

                    const searched = res.data[randNum].embed_url;

                    return searched;
                }
            }
        })
        .catch(error => logger.error(error));
}