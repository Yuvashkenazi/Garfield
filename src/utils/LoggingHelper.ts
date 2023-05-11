import pino from 'pino';
import pretty from 'pino-pretty';
import { createWriteStream } from 'fs'
import { getFilePath } from '../repository/FileRepo';
import { isDevEnv } from './Common';
import { FileBasePaths } from '../constants/FileBasepaths';

const LOG_FILE_DESTINATION = getFilePath(FileBasePaths.Logs, 'filename.log');

const streams = [
    { stream: pretty() },
    { stream: createWriteStream(LOG_FILE_DESTINATION) },
];

export const logger = isDevEnv() ?
    console :
    pino({
        formatters: {
            level: label => {
                return { level: label };
            },
        },
    }, pino.multistream(streams));
