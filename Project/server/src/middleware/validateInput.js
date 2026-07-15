const ResponseFormatter = require('../utils/responseFormatter');

const validateInput = (requiredFields) => {
    return (req, res, next) => {
        const missing = requiredFields.filter(field => !req.body || !req.body[field]);
        if (missing.length > 0) {
            return ResponseFormatter.error(res, `Missing required fields: ${missing.join(', ')}`, 'VALIDATION_ERROR', {}, 400);
        }
        next();
    };
};

module.exports = validateInput;
