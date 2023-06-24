import { PathLike, readdirSync, unlinkSync, rmSync, existsSync, Dirent } from 'fs';
import fs from 'fs/promises';
import { sep, basename, resolve, join as pathJoin } from 'path';
import { isDevEnv } from '../utils/Common.js';
import { logger } from '../utils/LoggingHelper.js';

export function loadFiles(dir: string): string[] {
    const path = join(process.cwd(), 'dist', dir);

    const files = readdirSync(path)
        .filter(file => file.endsWith('.js'))
        .map(file => join(path, file));

    return files
}

export async function initCheck(filePath: string, defaultValue = ''): Promise<void> {
    const fileName = basename(filePath);
    let fileExists = false;
    try {
        await fs.access(filePath);

        fileExists = true;
        logger.info(`${fileName} was found.`)
    }
    catch {
        logger.error(`${fileName} was not found.`);

        fileExists = false;
    }
    finally {
        if (!fileExists)
            await write(filePath, JSON.stringify(defaultValue));
    }
}

export async function read(filePath: PathLike): Promise<string | void> {
    const text = await fs.readFile(filePath, { encoding: 'utf8' })
        .catch(err => {
            logger.error(err);
        });

    return text;
}

export async function readDir(filePath: PathLike): Promise<Dirent[]> {
    return await fs.readdir(filePath, { withFileTypes: true });
}

export async function write(filePath: PathLike, data: string): Promise<void> {
    const text = typeof (data) === 'string' ? data : JSON.stringify(data);

    if (!text) return;

    return await fs.writeFile(filePath, text)
        .catch(err => {
            logger.error(err);
        });
}

export async function append(filePath: PathLike, data: string | Uint8Array) {
    try {
        await fs.appendFile(filePath, data);
    } catch (error) {
        logger.error(error);
    }
}

export function deleteFile(filePath: PathLike): void {
    return unlinkSync(filePath);
}

export function deleteDir(dirPath: PathLike): void {
    return rmSync(dirPath, { recursive: true, force: true })
}

export function getFilePath(basePath: string, fileName = ''): string {
    const DOCKER_VOLUME_PATH = 'garfield-data';

    return isDevEnv() ?
        join(resolve(), basePath, fileName) :
        join(sep, 'usr', 'src', DOCKER_VOLUME_PATH, basePath, fileName);
}

export function exists(path: string): boolean {
    return existsSync(path);
}

export function join(...paths: string[]) {
    return pathJoin(...paths);
}
