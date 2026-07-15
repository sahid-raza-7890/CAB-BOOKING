const AdminRole = require('../models/AdminRole');
const AdminPermission = require('../models/AdminPermission');
const AdminAuditService = require('./adminAuditService');

const DEFAULT_MODULES = [
    'Dashboard', 'Analytics', 'Users', 'Drivers', 'Rides', 
    'Compliance', 'Finance', 'Promotions', 'Safety', 'Notifications', 
    'Settings', 'Audit Logs', 'RBAC'
];

const DEFAULT_ACTIONS = [
    'View', 'Create', 'Update', 'Delete', 'Approve', 'Reject', 'Assign', 'Export', 'Manage'
];

const DEFAULT_ROLES = [
    { name: 'Super Admin', description: 'Full access to all modules', isSystem: true, permissions: [] },
    { name: 'Operations Manager', description: 'Manage rides, drivers, and users', isSystem: true, permissions: [] },
    { name: 'Finance Manager', description: 'Manage finance and earnings', isSystem: true, permissions: [] },
    { name: 'Support Manager', description: 'Manage safety and support tickets', isSystem: true, permissions: [] },
    { name: 'Compliance Officer', description: 'Manage document verification', isSystem: true, permissions: [] },
    { name: 'Marketing Manager', description: 'Manage promotions and incentives', isSystem: true, permissions: [] },
    { name: 'Read Only Analyst', description: 'View access only', isSystem: true, permissions: [] }
];

class AdminRoleService {

    static async seedDefaultRoles() {
        // Seed permissions
        for (const mod of DEFAULT_MODULES) {
            for (const action of DEFAULT_ACTIONS) {
                const key = `${mod.toLowerCase().replace(' ', '')}.${action.toLowerCase()}`;
                await AdminPermission.updateOne(
                    { key },
                    { module: mod, action, key, description: `Allow ${action} on ${mod}` },
                    { upsert: true }
                );
            }
        }

        // Seed roles
        const allPermissions = await AdminPermission.find();
        const allPermKeys = allPermissions.map(p => p.key);

        for (const roleDef of DEFAULT_ROLES) {
            let perms = [];
            if (roleDef.name === 'Super Admin') {
                perms = allPermKeys;
            } else if (roleDef.name === 'Read Only Analyst') {
                perms = allPermKeys.filter(k => k.endsWith('.view'));
            } else {
                // Approximate other roles or leave empty for now
                perms = allPermKeys.filter(k => k.endsWith('.view'));
            }

            await AdminRole.updateOne(
                { name: roleDef.name },
                { description: roleDef.description, isSystem: roleDef.isSystem, $addToSet: { permissions: { $each: perms } } },
                { upsert: true }
            );
        }
    }

    static async getRoles() {
        await this.seedDefaultRoles();
        return await AdminRole.find().sort({ name: 1 });
    }

    static async getRole(id) {
        return await AdminRole.findById(id);
    }

    static async createRole(payload, adminId, ipAddress, io) {
        const role = new AdminRole({ ...payload, createdBy: adminId });
        await role.save();

        await AdminAuditService.logAction({
            adminId,
            action: 'CREATE_ROLE',
            targetType: 'AdminRole',
            targetId: role._id,
            details: { name: role.name },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('roleUpdated', role);
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return role;
    }

    static async updateRole(id, payload, adminId, ipAddress, io) {
        const role = await AdminRole.findById(id);
        if (!role) throw new Error("Role not found");
        
        if (role.isSystem && payload.name && payload.name !== role.name) {
            throw new Error("Cannot rename system role");
        }

        const oldValue = { permissions: role.permissions };
        
        if (payload.name) role.name = payload.name;
        if (payload.description) role.description = payload.description;
        if (payload.permissions) role.permissions = payload.permissions;
        role.updatedBy = adminId;

        await role.save();

        await AdminAuditService.logAction({
            adminId,
            action: 'UPDATE_ROLE',
            targetType: 'AdminRole',
            targetId: role._id,
            details: { name: role.name, oldValue, newValue: { permissions: role.permissions } },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('roleUpdated', role);
        }

        return role;
    }

    static async deleteRole(id, adminId, ipAddress, io) {
        const role = await AdminRole.findById(id);
        if (!role) throw new Error("Role not found");
        if (role.isSystem) throw new Error("Cannot delete a system role");

        await AdminRole.deleteOne({ _id: id });

        await AdminAuditService.logAction({
            adminId,
            action: 'DELETE_ROLE',
            targetType: 'AdminRole',
            targetId: role._id,
            details: { name: role.name },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('roleUpdated', { id, deleted: true });
        }

        return { success: true };
    }

    static async assignRole(roleId, userId, adminId, ipAddress, io) {
        // Ideally we would update the AdminUser record
        const AdminUser = require('../models/AdminUser');
        const user = await AdminUser.findById(userId);
        if (!user) throw new Error("User not found");

        user.roleId = roleId;
        await user.save();

        await AdminAuditService.logAction({
            adminId,
            action: 'ASSIGN_ROLE',
            targetType: 'AdminUser',
            targetId: user._id,
            details: { roleId },
            ipAddress
        });

        return user;
    }

    static async removeRole(roleId, userId, adminId, ipAddress, io) {
        const AdminUser = require('../models/AdminUser');
        const user = await AdminUser.findById(userId);
        if (!user) throw new Error("User not found");

        user.roleId = null;
        await user.save();

        await AdminAuditService.logAction({
            adminId,
            action: 'REMOVE_ROLE',
            targetType: 'AdminUser',
            targetId: user._id,
            details: { roleId },
            ipAddress
        });

        return user;
    }

    static async getPermissions() {
        await this.seedDefaultRoles();
        return await AdminPermission.find().sort({ module: 1, action: 1 });
    }

    static async createPermission(payload, adminId, ipAddress, io) {
        const perm = new AdminPermission(payload);
        await perm.save();

        await AdminAuditService.logAction({
            adminId,
            action: 'CREATE_PERMISSION',
            targetType: 'AdminPermission',
            targetId: perm._id,
            details: { key: perm.key },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('permissionUpdated', perm);
        }

        return perm;
    }

    static async updatePermission(id, payload, adminId, ipAddress, io) {
        const perm = await AdminPermission.findByIdAndUpdate(id, payload, { new: true });

        await AdminAuditService.logAction({
            adminId,
            action: 'UPDATE_PERMISSION',
            targetType: 'AdminPermission',
            targetId: perm._id,
            details: { key: perm.key },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('permissionUpdated', perm);
        }

        return perm;
    }

    static async deletePermission(id, adminId, ipAddress, io) {
        const perm = await AdminPermission.findByIdAndDelete(id);
        
        await AdminAuditService.logAction({
            adminId,
            action: 'DELETE_PERMISSION',
            targetType: 'AdminPermission',
            targetId: id,
            details: { key: perm?.key },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('permissionUpdated', { id, deleted: true });
        }

        return { success: true };
    }
}

module.exports = AdminRoleService;
