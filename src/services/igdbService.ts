import { logger } from "../utils/LoggingHelper.js";

const BASE_URL = 'https://api.igdb.com/v4';
const AUTH_BASE_URL = 'https://id.twitch.tv/oauth2/token';

interface QueryParams {
  clientId: string;
  clientSecret: string;
  endpoint?: string;
  search?: string;
  where?: string;
  fields?: string[];
  limit?: number;
}

interface GameData {
  id: string;
  name?: string;
  image_id?: string;
  summary?: string;
  total_rating?: number;
}

export async function query({
  clientId,
  clientSecret,
  endpoint = 'games',
  search = '',
  where = '',
  fields = [],
  limit = 1,
}: QueryParams): Promise<GameData[]> {
  const token = await authorize(clientId, clientSecret);

  const url = new URL(`${BASE_URL}/${endpoint}`);

  const headers = {
    'Client-ID': clientId,
    'Authorization': `Bearer ${token}`
  };

  const body = `
fields ${fields.join()};
limit ${limit};
${!search ? '' : `search "${search}";`}
${!where ? '' : `where ${where};`}
  `

  const results = await fetch(url, { method: 'POST', body, headers })
    .then(res => res.json())
    .catch(error => logger.error(error));

  if (!results) {
    return null;
  }

  return results as GameData[];
}

async function authorize(clientId: string, clientSecret: string): Promise<string> {
  const url = new URL(AUTH_BASE_URL);

  url.searchParams.append('client_id', clientId);
  url.searchParams.append('client_secret', clientSecret);
  url.searchParams.append('grant_type', 'client_credentials');

  return await fetch(url, { method: 'POST', redirect: 'follow' })
    .then(res => res.json())
    .then((data: any) => data.access_token)
    .catch(error => {
      logger.error(error);
      return ''
    });
}
