import { Manga, MangaChapter } from './DatabaseRepo.js';
import { MangaModel, MangaChapterModel } from '../models/index.js';
import { logger } from '../utils/LoggingHelper.js';

export async function getManga(): Promise<MangaModel | void> {
  return await Manga.findOrCreate({
    where: {},
    defaults: {
      name: '',
      chapter: 0,
      page: 0
    }
  })
    .then(data => data[0].toJSON())
    .catch(err => logger.error(err));
}

export async function getMangaChapters(name: string): Promise<MangaChapterModel[]> {
  return await MangaChapter.findAll({ where: { name } })
    .then(data => data.map(x => x.toJSON()))
    .catch(err => {
      logger.error(err);
      return [];
    });
}

export async function updateManga({ name, chapter, page }: { name: string, chapter: number, page: number }): Promise<number | void> {
  return await Manga.update({ name, chapter, page }, {
    where: {}
  })
    .then(data => data[0])
    .catch(err => logger.error(err));
}

export async function updateChapterList(name: string, chList: { number: number, url: string }[]): Promise<void> {
  if (!Array.isArray(chList) || chList.length === 0) return;

  await MangaChapter.destroy({ where: {} });

  for (const ch of chList) {
    await MangaChapter.create({
      name,
      number: ch.number,
      url: ch.url
    })
      .catch(err => logger.error(err));
  }
}
