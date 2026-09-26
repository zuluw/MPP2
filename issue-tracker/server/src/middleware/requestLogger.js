const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const durationMs = Date.now() - startTime;
        const statusCode = res.statusCode;

        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: statusCode,
            durationMs: `${durationMs}ms`,
            ip: req.ip || req.connection.remoteAddress || 'unknown',
            userId: req.user ? req.user.id : null,
            role: req.user ? req.user.role : 'anonymous'
        };

        if (statusCode >= 500) {
            logger.error(`HTTP Request Failed (${statusCode})`, logData);
        } else if (statusCode >= 400) {
            logger.warn(`HTTP Request Client Error (${statusCode})`, logData);
        } else {
            logger.info(`HTTP Request Success (${statusCode})`, logData);
        }
    });

    next();
};

module.exports = requestLogger;