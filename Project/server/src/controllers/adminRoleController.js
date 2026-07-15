const AdminRoleService = require('../services/adminRoleService');
const ResponseFormatter = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

class AdminRoleController {
    static getRoles = asyncWrapper(async (req, res) => {
        const roles = await AdminRoleService.getRoles();
        return ResponseFormatter.successAdmin(res, roles, 'Roles retrieved');
    });

    static getRole = asyncWrapper(async (req, res) => {
        const role = await AdminRoleService.getRole(req.params.id);
        return ResponseFormatter.successAdmin(res, role, 'Role retrieved');
    });

    static createRole = asyncWrapper(async (req, res) => {
        const role = await AdminRoleService.createRole(req.body, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, role, 'Role created');
    });

    static updateRole = asyncWrapper(async (req, res) => {
        const role = await AdminRoleService.updateRole(req.params.id, req.body, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, role, 'Role updated');
    });

    static deleteRole = asyncWrapper(async (req, res) => {
        const result = await AdminRoleService.deleteRole(req.params.id, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, result, 'Role deleted');
    });

    static assignRole = asyncWrapper(async (req, res) => {
        const { userId } = req.body;
        const result = await AdminRoleService.assignRole(req.params.id, userId, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, result, 'Role assigned');
    });

    static removeRole = asyncWrapper(async (req, res) => {
        const { userId } = req.body;
        const result = await AdminRoleService.removeRole(req.params.id, userId, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, result, 'Role removed');
    });

    static getPermissions = asyncWrapper(async (req, res) => {
        const permissions = await AdminRoleService.getPermissions();
        return ResponseFormatter.successAdmin(res, permissions, 'Permissions retrieved');
    });
}

module.exports = AdminRoleController;
