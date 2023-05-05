import pino from 'pino';
import { isDevEnv } from './Common';

export const logger = isDevEnv() ?
    console :
    pino({
        formatters: {
            level: label => {
                return { level: label };
            },
        },
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
                translateTime: 'yyyy-mm-dd HH:MM:ss.l',
            },
        }
    });
