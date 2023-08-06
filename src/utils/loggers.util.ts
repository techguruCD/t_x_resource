import path from 'path'
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDirectory = path.join(__dirname, '..', '..', 'logs');

class Logger {

    service: string;
    errorFilename: string;
    combinedFilename: string;
    transports: winston.transport[];
    logger: winston.Logger;

    constructor(_service: string, _errorFilename: string, _combinedFilename: string) {
        this.service = _service
        this.errorFilename = _errorFilename;
        this.combinedFilename = _combinedFilename;

        this.transports = [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:SSS' }),
                    winston.format.prettyPrint()
                ),
                handleExceptions: true,
                handleRejections: true
            }),
        ]

        if (process.env['MODE'] === 'production') {
            this.transports = [
                new winston.transports.Console({
                    level: 'error',
                    format: winston.format.combine(
                        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:SSS' }),
                        winston.format.prettyPrint()
                    ),
                    handleExceptions: true,
                    handleRejections: true
                }),
                new DailyRotateFile({
                    level: 'error',
                    format: winston.format.combine(
                        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:SSS' }),
                        winston.format.prettyPrint()
                    ),
                    dirname: logDirectory,
                    filename: `${this.errorFilename}-%DATE%.log`,
                    datePattern: 'DD-MM-YYYY',
                    maxFiles: '3d',
                    handleExceptions: true,
                    handleRejections: true
                }),
                new DailyRotateFile({
                    format: winston.format.combine(
                        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:SSS' }),
                        winston.format.prettyPrint()
                    ),
                    dirname: logDirectory,
                    filename: `${this.combinedFilename}-%DATE%.log`,
                    datePattern: 'DD-MM-YYYY',
                    maxFiles: '3d',
                    handleExceptions: true,
                    handleRejections: true
                })
            ]
        }

        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json({ space: 2 }),
            defaultMeta: { service: this.service },
            exitOnError: false,
            transports: this.transports
        })
    }
}

const mainLogger = new Logger('main-service', 'main-errors', 'main-combined').logger;
const cmcLogger = new Logger('cmc-service', 'cmc-errors', 'cmc-combined').logger;
const bitqueryLogger = new Logger('bitquery-service', 'bitquery-errors', 'bitquery-combined').logger;
const dexToolsLogger = new Logger('dextools-service', 'dextools-errors', 'dextools-combined').logger;

const loggersUtil = {
    mainLogger,
    cmcLogger,
    bitqueryLogger,
    dexToolsLogger
}

export default loggersUtil;