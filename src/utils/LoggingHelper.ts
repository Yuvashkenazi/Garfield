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
    winston.format.printf(info => `${date}-${info.level}: ${info.message}`)
);

// const transport: DailyRotateFile = new DailyRotateFile({
//     filename: 'garfield-%DATE%.log',
//     dirname: getFilePath(FileBasePaths.Logs),
//     datePattern: 'YYYY-MM-DD-HH',
//     zippedArchive: true,
//     maxSize: '20m',
//     maxFiles: '14d',
//     format
// });

export const logger = isDevEnv() ?
    console :
    winston.createLogger({
        transports: [
            new winston.transports.Console({ format }),
            // transport
        ],
    });
