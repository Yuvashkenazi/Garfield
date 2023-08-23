import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { getFilePath } from '../repository/FileRepo';
import { FileBasePaths } from '../constants/FileBasepaths';
import { isDevEnv } from './Common';

winston.addColors({
    silly: 'magenta',
    debug: 'blue',
    verbose: 'cyan',
    info: 'green',
    warn: 'yellow',
    error: 'red'
});

const date = new Date().toISOString();
const format = winston.format.combine(
    winston.format.colorize(),
    winston.format.errors({ stack: true }),
    winston.format.printf(info => `${date}-${info.level}: ${info.message}`)
);

const fileTransport = new DailyRotateFile({
    level: 'info',
    filename: 'garfield-%DATE%.log',
    dirname: getFilePath(FileBasePaths.Logs),
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

export const logger = isDevEnv() ?
    console :
    winston.createLogger({
        level: 'info',
        format,
        transports: [
            new winston.transports.Console(),
            fileTransport
        ],
    });
