const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logDirectory = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const jsonLogFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }), 
    winston.format.json()
);

const consoleLogFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `[${timestamp}] ${level}: ${message} ${metaString}`;
    })
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: jsonLogFormat,
    defaultMeta: { service: 'issue-tracker-api' },
    transports: [
        new winston.transports.File({
            filename: path.join(logDirectory, 'error.log'),
            level: 'error',
            maxsize: 5 * 1024 * 1024
        }),
        new winston.transports.File({
            filename: path.join(logDirectory, 'app.log'),
            maxsize: 10 * 1024 * 1024
        })
    ]
});

logger.add(new winston.transports.Console({
    format: consoleLogFormat
}));

module.exports = logger;