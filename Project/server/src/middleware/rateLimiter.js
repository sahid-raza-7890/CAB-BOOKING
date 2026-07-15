const rateLimit = require('express-rate-limit');
const ResponseFormatter = require('../utils/responseFormatter');

// Helper to construct the 429 response
const createRateLimitHandler = (message) => {
    return (req, res, next, options) => {
        // Send our standardized error response format
        res.status(options.statusCode).json({
            success: false,
            message: message || options.message,
            requestId: req.requestId || null,
            timestamp: new Date().toISOString()
        });
    };
};

const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler("Too many authentication attempts, please try again later.")
});

const passengerLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler("Too many requests from this passenger account, please try again later.")
});

const driverLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 150, // 150 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler("Too many requests from this driver account, please try again later.")
});

const adminLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 300, // 300 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler("Too many requests from this admin account, please try again later.")
});

const uploadsLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler("Too many upload attempts, please try again later.")
});

module.exports = {
    authLimiter,
    passengerLimiter,
    driverLimiter,
    adminLimiter,
    uploadsLimiter
};
