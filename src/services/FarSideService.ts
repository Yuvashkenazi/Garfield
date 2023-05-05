import { AttachmentBuilder } from "discord.js";
import moment from "moment-timezone";
import { getFilePath, readDir, deleteFile } from '../repository/FileRepo.js';
import { launchNewBrowser, goToNewPage } from "../utils/PuppeteerHelper.js";
import { getRandomInteger } from "../utils/Common.js";
import { FileBasePaths } from "../constants/FileBasepaths.js";
import { logger } from "../utils/LoggingHelper.js";

const FARSIDE_BASE_PATH = getFilePath(FileBasePaths.FarSide);

export async function randomFarSide() {
  const comicFiles = await downloadFarSideAndRetry(2);

  if (comicFiles.length === 0) {
    return;
  }

  const randomIndex = getRandomInteger({ max: comicFiles.length - 1 });

  const chosen = comicFiles[randomIndex];

  const combinedPath = getFilePath(FileBasePaths.FarSide, chosen);

  const file = new AttachmentBuilder(combinedPath);

  const msg = { files: [file] };

  return msg;
}

async function downloadFarSideAndRetry(retries: number): Promise<string[]> {
  let comicFiles = await readDir(FARSIDE_BASE_PATH);

  for (let i = 0; i < retries; i++) {
    if (comicFiles.length === 0) {
      await downloadFarSide(i === retries - 1);

      comicFiles = await readDir(FARSIDE_BASE_PATH);
    }
  }
  return comicFiles;
}

export async function downloadFarSide(yesterdays = false) {
  logger.info('downloading today\'s farside...')

  const date = new Date()
    .toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
    .replace(/\//, '-');

  const baseUrl = getFarsideBaseUrl(true, yesterdays);

  const comicFiles = await readDir(FARSIDE_BASE_PATH);

  for (const file of comicFiles) {
    logger.info('deleting old file...')
    const combinedPath = getFilePath(FileBasePaths.FarSide, file);
    deleteFile(combinedPath);
  }

  const browser = await launchNewBrowser();

  const privacySelector = 'a.cc-dismiss';
  const comicSelector = 'div.card-body';

  for (let i = 0; i < 5; i++) {
    const url = baseUrl + i;

    const comicFileName = `${i}-far-side-${date}.png`;

    const comicFilePath = getFilePath(FileBasePaths.FarSide, comicFileName);

    const page = await goToNewPage(browser, url);

    if (page.url() === getFarsideBaseUrl()) {
      logger.info('redirected to main page!')
      continue;
    }

    await page.waitForSelector(privacySelector, { visible: true, timeout: 3000 })
      .then(async () => {
        await page.tap(privacySelector);
        await delay(1000);
      })
      .catch((err) => { logger.error(err) });

    await page.setViewport({
      width: 1080,
      height: 820
    });

    const comicEl = await page.$(comicSelector);
    await comicEl.screenshot({ path: comicFilePath });

    logger.info('comic downloaded...');
    await page.close();
  }
  await browser.close();
}

function getFarsideBaseUrl(withDate = false, yesterdays = false): string {
  const toSubtract = yesterdays ? 1 : 0;

  const date = moment().subtract(toSubtract, 'days').tz('America/Chicago').format('YYYY/MM/DD');

  const baseUrl = 'https://www.thefarside.com';

  return `${baseUrl}/${withDate ? `${date}/` : ''}`;
}

function delay(time: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  });
}
