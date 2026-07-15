const ResponseFormatter = require('../utils/responseFormatter');

const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${req.method} ${req.url} - ${err.message}`, err.stack);
    
    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        return ResponseFormatter.error(res, 'Validation Error', 'VALIDATION_ERROR', { errors: err.errors, stack: err.stack }, 400);
    }
    
    // Mongoose Cast Error (Invalid ID)
    if (err.name === 'CastError') {
        return ResponseFormatter.error(res, 'Invalid Resource ID', 'INVALID_ID', {}, 400);
    }
    
    // JWT Error
    if (err.name === 'JsonWebTokenError') {
        return ResponseFormatter.error(res, 'Invalid Token', 'AUTH_ERROR', {}, 401);
    }

    // Conflict Error (e.g. race condition on dual driver accept)
    if (err.name === 'ConflictError' || err.statusCode === 409) {
        return ResponseFormatter.error(res, err.message || 'Conflict', 'CONFLICT', {}, 409);
    }

    // Generic errors that carry an explicit HTTP statusCode
    if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
        return ResponseFormatter.error(res, err.message || 'Bad Request', 'CLIENT_ERROR', {}, err.statusCode);
    }

    // Default 500
    return ResponseFormatter.error(res, err.message || 'Internal Server Error', 'SERVER_ERROR', {}, 500);
};

module.exports = errorHandler;
