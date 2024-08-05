import { load } from "cheerio";
import { getRandomInteger } from "../utils/Common.js";
import { logger } from "../utils/LoggingHelper.js";

const baseUrl = 'https://poorlydrawnlines.com';

export async function randomPoorlyDrawn(): Promise<string> {

  const comicUrl = await getFromArchive();

  return comicUrl;
}

function getRandomArchivePage(): string {
  const randomIndex = getRandomInteger({ min: 1, max: 8 });

  return `${baseUrl}/archive/page/${randomIndex}/?et_blog`;
}

async function getFromArchive(): Promise<string> {
  const archiveUrl = getRandomArchivePage();

  return await fetch(archiveUrl)
    .then(res => res.text())
    .then(data => {
      const $ = load(data);

      const $gallery = $('div.et_pb_salvattore_content');

      const $galleryItems = $gallery.children('article');

      const randomIndex = getRandomInteger({ min: 0, max: $galleryItems.length - 1 });

      const $randomComic = $($galleryItems[randomIndex]);

      const href = $randomComic.find('img').attr('data-src');

      return href;
    })
    .catch(err => {
      logger.error(err);

      return '';
    });
}
