const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
    // Generate correlation ID
    const requestId = req.headers['x-request-id'] || uuidv4();
    req.requestId = requestId;

    // Send it back to the client
    res.setHeader('X-Request-ID', requestId);

    const startTime = Date.now();

    // Hook into response finish to log the request
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const userId = req.user ? (req.user.userId || req.user.id) : null;
        
        const logData = {
            requestId,
            method: req.method,
            endpoint: req.originalUrl,
            status: res.statusCode,
            duration,
            ip: req.ip || req.connection.remoteAddress,
            'user-agent': req.headers['user-agent']
        };

        if (userId) {
            logData.userId = userId;
            if (req.user.role === 'Admin') logData.adminId = userId;
            if (req.user.role === 'Driver') logData.driverId = userId;
        }

        // Log based on status code
        if (res.statusCode >= 500) {
            logger.error(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, logData);
        } else if (res.statusCode >= 400) {
            logger.warn(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, logData);
        } else {
            logger.http(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, logData);
        }
    });

    next();
};

module.exports = requestLogger;
