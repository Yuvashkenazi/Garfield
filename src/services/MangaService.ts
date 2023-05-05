import { load } from "cheerio";
import { launchNewBrowser, goToNewPage } from "../utils/PuppeteerHelper.js";
import { getManga, getMangaChapters, updateManga, updateChapterList } from "../repository/MangaRepo.js";
import { logger } from "../utils/LoggingHelper.js";

const BASE_URL = 'https://1stkissmanga.tv/manga';
//get CDN date from chapter list scrape? store in DB?
const BASE_CDN_URL = 'https://cdn.1stkissmanga.tv/image/2021/06/19';

export async function setManga({ name, chapter, page }) {
    await updateManga({ name, chapter: chapter ?? 0, page: page ?? 0 });
}

export async function nextManga(ch, retry = true) {
    const manga = await getManga();

    if (!manga) return;

    const mangaName = manga.name;
    const mangaCh = manga.chapter;
    const mangaPage = manga.page;

    if (!mangaName) {
        logger.error('Manga not set.');
        return;
    }

    let chapterList = await getMangaChapters(mangaName);

    if (!chapterList || chapterList.length === 0) {
        await updateMangaChapterList(mangaName);

        chapterList = await getMangaChapters(mangaName);
    }

    const currentChapter = chapterList.find(x => x.number === mangaCh);

    if (!currentChapter) {
        logger.error('Chapter not found. Skipping to next chapter.');

        await updateManga({
            name: mangaName,
            chapter: mangaCh + 1,
            page: 1,
        });

        return;
    }

    const chapterName = currentChapter.url
        .replace(_getMangaUrl(mangaName), '')
        .replaceAll('/', '');

    const capitalized = _capitalizeUrl(`${mangaName}-${chapterName}`);

    const fileName = `${capitalized}-${mangaPage}.jpg`;

    const url = `${BASE_CDN_URL}/${fileName}`;

    await fetch(url)
        .then(async res => {
            if (res.ok) {
                ch.send(url);

                await updateManga({
                    name: mangaName,
                    chapter: mangaCh,
                    page: mangaPage + 1,
                });
            } else if (retry) {
                await updateManga({
                    name: mangaName,
                    chapter: mangaCh + 1,
                    page: 1,
                });

                await nextManga(ch, false);
            }
        })
        .catch(err => logger.error(err));
}

export async function updateMangaChapterList(mangaName: string): Promise<void> {
    const url = _getMangaUrl(mangaName);

    const chapterSelector = 'div#manga-chapters-holder';
    const readMoreSelector = 'div.c-chapter-readmore';

    const browser = await launchNewBrowser();

    const page = await goToNewPage(browser, url);

    await page.waitForSelector(readMoreSelector, { visible: true })
        .then(async () => {
            await page.tap(readMoreSelector);
        })
        .catch((error) => logger.error(error));

    const data = await page.evaluate(() => document.querySelector('*').outerHTML);

    const $ = load(data);

    const $chaptersHolder = $(chapterSelector);

    const $list = $chaptersHolder.find('ul');

    const chapters = [];

    $list.children().each((i, el) => {
        const $a = $(el).find('a');

        const text = $a.text().trim();
        const url = $a.attr('href');

        const regex = /(?<=Chapter )[0-9]?[0-9]?[0-9]?/g
        const match = text.match(regex);
        const number = parseInt(match.toString(), 10);

        chapters.push({ number, url });
    });

    logger.info(`found ${chapters.length} chapters`);

    await updateChapterList(mangaName, chapters);

    await page.close();

    await browser.close();
}

function _getMangaUrl(manga: string): string {
    return `${BASE_URL}/${manga}`;
}

function _capitalizeUrl(str: string): string {
    const result = str
        .split('-')
        .map(x => {
            if (x.length === 0) return '';

            const split = x.split('');
            const first = split.shift();

            const joined = [first.toUpperCase(), ...split].join('');

            return `${joined}`;
        });

    return result.join('-');
}
