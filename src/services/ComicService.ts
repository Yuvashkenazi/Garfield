import { load } from "cheerio";
import { ComicDate, Comics } from "../constants/Comics.js";
import { getRandomInteger } from "../utils/Common.js";
import { logger } from "../utils/LoggingHelper.js";

export function getComicObj(comicUrl: string) {
  return Object.values(Comics).find(x => x.urlName === comicUrl);
}

export async function findComic(comic: string): Promise<string> {
  let url = getComicUrl(comic);
  let found = await isComicFound(url, comic);
  let attempts = 1;

  while (!found) {
    logger.info('Comic not found for randomly generated date, trying again...');
    url = getComicUrl(comic);

    found = await isComicFound(url, comic);

    if (++attempts >= 25) break;
  }

  return found ? await getComicImageUrl(url) : 'Failed to find a comic. Try again.';
}

async function isComicFound(url: string, comic: string) {
  const comicObj = getComicObj(comic);

  if (!comicObj) return;

  return await fetch(url)
    .then(res => res.text())
    .then(data => {
      const $ = load(data);

      const $comic = $('div.comic');

      const comicName = $comic.attr('data-feature-name');

      if (comicName === undefined) {
        return false;
      }

      return comicName === comicObj.displayName;
    }).catch(err => {
      logger.error(err)
    });
}

async function getComicImageUrl(comicUrl: string): Promise<string> {
  return await fetch(comicUrl)
    .then(data => data.text())
    .then((res: any) => {
      const $ = load(res);

      const $comic = $('div.comic');

      const comicImageUrl = $comic.attr('data-image');

      return comicImageUrl;
    }).catch(err => {
      logger.error(err);
      return '';
    });
}

function getComicUrl(comic: string) {
  const comicObj = getComicObj(comic);

  if (!comicObj) return;

  const randomDate = _generateRandomDate(comicObj.start, comicObj.end);

  return `https://www.gocomics.com/${comic}/${randomDate}`;
}

function _generateRandomDate(startDate: ComicDate, endDate: ComicDate): string {
  if (!startDate.year || !startDate.month || !startDate.day) {
    startDate = {
      year: 2000,
      month: 1,
      day: 1
    };
  }

  if (!endDate.year || !endDate.month || !endDate.day) {
    endDate = {
      year: 2019,
      month: 9,
      day: 1
    };
  }

  const year = getRandomInteger({ min: startDate.year, max: endDate.year });

  let month: number;
  switch (year) {
    case startDate.year:
      month = getRandomInteger({ min: startDate.month, max: 12 });
      break;
    case endDate.year:
      month = getRandomInteger({ min: 1, max: endDate.month });
      break;
    default:
      month = getRandomInteger({ min: 1, max: 12 });
      break;
  }

  let day: number;
  const daysInMonth = _getDaysInMonth(month);
  switch (month) {
    case startDate.month:
      day = getRandomInteger({ min: startDate.day, max: daysInMonth });
      break;
    case endDate.month:
      day = getRandomInteger({ min: 1, max: endDate.day });
      break;
    default:
      day = getRandomInteger({ min: 1, max: daysInMonth });
      break;
  }

  return `${year}/${month}/${day}`;
}

function _getDaysInMonth(month: number): number {
  switch (month) {
    case 1:
      return 31;
    case 2:
      return 28;
    case 3:
      return 31;
    case 4:
      return 30;
    case 5:
      return 31;
    case 6:
      return 30;
    case 7:
      return 31;
    case 8:
      return 31;
    case 9:
      return 30;
    case 10:
      return 31;
    case 11:
      return 30;
    case 12:
      return 31;
    default:
      return -1;
  }
}
