const ResponseFormatter = require('../utils/responseFormatter');

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return ResponseFormatter.error(res, 'Unauthorized access', 'ROLE_ERROR', {}, 403);
        }

        if (!allowedRoles.includes(req.user.role)) {
            return ResponseFormatter.error(res, `Requires one of roles: ${allowedRoles.join(', ')}`, 'FORBIDDEN', {}, 403);
        }

        next();
    };
};

module.exports = requireRole;
