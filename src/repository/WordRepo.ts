import { getFilePath, initCheck as baseInitCheck, read, append } from './FileRepo.js';
import { FileBasePaths } from '../constants/FileBasepaths.js';

const FILENAME = 'whatwesay.txt';
const PATH = getFilePath(FileBasePaths.Data, FILENAME);

export async function initCheck(): Promise<void> {
  return await baseInitCheck(PATH);
}

export async function getList(): Promise<string[]> {
  const content = await read(PATH);

  if (!content) return [];

  const filteredRecords = content.split('\n').filter(record => record !== '');

  return filteredRecords;
}

export async function addWord(word: string): Promise<void> {
  return await append(PATH, `${word}\n`);
}
