import pino from 'pino';
import { env } from './env';

export const logger = pino({
    level: env.LOG_LEVEL,
    formatters: {
        level: (label) => ({ level: label })
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    // Pretty print in development
    transport: env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname'
        }
    } : undefined
});
