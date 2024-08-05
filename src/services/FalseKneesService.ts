import { load } from "cheerio";
import { getRandomInteger } from "../utils/Common.js";
import { logger } from "../utils/LoggingHelper.js";

const baseUrl = 'https://falseknees.com';

export async function randomFalseKnees(): Promise<string> {

  const randomComicUrl = await getFromArchive();

  const comicUrl = await getImage(randomComicUrl);

  return comicUrl;
}

async function getFromArchive(): Promise<string> {
  const archiveUrl = `${baseUrl}/archive.html`;

  let comicPath = '';

  await fetch(archiveUrl)
    .then(res => res.text())
    .then(data => {
      const $ = load(data);

      const $gallery = $('div#gallery');

      const $galleryItems = $gallery.children('div');

      const randomIndex = getRandomInteger({ min: 0, max: $galleryItems.length - 1 });

      const $randomComic = $($galleryItems[randomIndex]);

      const $link = $randomComic.find('a');

      const href = $link.attr('href');

      comicPath = href;
    })
    .catch(err => {
      logger.error(err);
    });

  return `${baseUrl}${comicPath}`;
}

async function getImage(url: string): Promise<string> {

  let imagePath = '';

  await fetch(url)
    .then(res => res.text())
    .then(data => {
      const $ = load(data);

      const $img = $('body > div.w3-container.w3-center img');

      imagePath = $img.attr('src');
    })
    .catch(err => {
      logger.error(err);
    });

  return `${baseUrl}/comics/${imagePath}`;
}