const ResponseFormatter = require('../utils/responseFormatter');
const User = require('../models/User');
const AdminRole = require('../models/AdminRole');

const requirePermission = (permissionKey) => {
    return async (req, res, next) => {
        try {
            // Assume req.user is set by authMiddleware
            if (!req.user || req.user.role !== 'Admin') {
                return ResponseFormatter.errorAdmin(res, 'Access denied', 403);
            }

            // If we have super admin check, they pass everything
            const user = await User.findById(req.user.id).populate('adminRoleId');
            if (!user) {
                return ResponseFormatter.errorAdmin(res, 'User not found', 404);
            }

            // If user has no role, deny
            if (!user.adminRoleId) {
                return ResponseFormatter.errorAdmin(res, 'No role assigned', 403);
            }

            // Super Admin has all permissions implicitly
            if (user.adminRoleId.name === 'Super Admin') {
                return next();
            }

            // Check if role has the specific permission
            if (user.adminRoleId.permissions && user.adminRoleId.permissions.includes(permissionKey)) {
                return next();
            }

            return ResponseFormatter.errorAdmin(res, `Missing required permission: ${permissionKey}`, 403);
        } catch (error) {
            console.error('RBAC Error:', error);
            return ResponseFormatter.errorAdmin(res, 'Server error during permission check', 500);
        }
    };
};

module.exports = { requirePermission };
