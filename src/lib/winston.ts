import fs from 'fs';
import { createLogger, transports, format, Logger } from 'winston';
import winstonDaily from 'winston-daily-rotate-file';

const { combine, colorize, label, timestamp, printf } = format;

let logDirectory = __dirname + '/../logs/production';

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const loggerBuffer: { [key: string]: Logger } = {};

declare global {
    function getLogger(moduleName: string, methodName?: string): Logger;
}

global.getLogger = (moduleName: string, methodName?: string) => {
    let categoryName = moduleName;
    if (methodName) {
        categoryName = [moduleName, methodName].join('-');
    }

    let level = 'info';
    if (process.env.NODE_ENV === 'development') {
        logDirectory = __dirname + '/../logs/development';
        if (!fs.existsSync(logDirectory)) {
            fs.mkdirSync(logDirectory, { recursive: true });
        }
        level = 'debug';
    }

    if (!loggerBuffer[categoryName]) {
        loggerBuffer[categoryName] = createLogger({
            format: combine(
                colorize({ level: true }),
                label({ label: categoryName }),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                printf((info) => `${info.timestamp} - (${info.level})[${info.label}]: ${info.message}`),
            ),
            transports: [
                new transports.Console({ level: level }),
                new winstonDaily({
                    level: level,
                    datePattern: 'YYYY-MM-DD',
                    dirname: logDirectory,
                    filename: '%DATE%.log',
                    maxFiles: 30,
                    zippedArchive: true,
                }),
                new winstonDaily({
                    level: 'error',
                    datePattern: 'YYYY-MM-DD',
                    dirname: `${logDirectory}/error`,
                    filename: '%DATE%.error.log',
                    maxFiles: 30,
                    zippedArchive: true,
                }),
            ],

            exceptionHandlers: [
                new winstonDaily({
                    level: 'error',
                    datePattern: 'YYYY-MM-DD',
                    dirname: `${logDirectory}`,
                    filename: '%DATE%.exception.log',
                    maxFiles: 30,
                    zippedArchive: true,
                }),
            ],
        });

        // loggerBuffer[categoryName] = loggers.add(categoryName, {
        //     format: combine(
        //         colorize({ level: true }),
        //         label({ label: categoryName }),
        //         timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        //         printf((info) => `${info.timestamp} - (${info.level})[${info.label}]: ${info.message}`),
        //     ),
        //     transports: [
        //         new transports.Console({ level: 'info' }),
        //         new transports.File({
        //             level: 'debug',
        //             filename: 'debug.log',
        //             dirname: logDirectory,
        //         }),
        //     ],
        // });
    }

    // return loggers.get(categoryName);
    return loggerBuffer[categoryName];
};

const httpLogStream = (logger: Logger) => {
    const result = {
        write: (message: string) => {
            logger.http(message);
        },
    };

    return result;
};

export { httpLogStream };
