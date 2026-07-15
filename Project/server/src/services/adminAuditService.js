const AdminAudit = require('../models/AdminAudit');

class AdminAuditService {
    /**
     * Log an administrative action.
     * @param {object} params
     * @param {string} params.adminId
     * @param {string} params.action
     * @param {string} params.targetType
     * @param {string} params.targetId
     * @param {object} [params.details]
     * @param {string} [params.ipAddress]
     */
    static async logAction({ adminId, action, targetType, targetId, details = {}, ipAddress }) {
        try {
            const crypto = require('crypto');
            
            const auditData = {
                adminId: adminId.toString(),
                action,
                targetType,
                targetId: targetId ? targetId.toString() : null,
                details: JSON.stringify(details),
                ipAddress: ipAddress || 'unknown',
                timestamp: Date.now() // rough timestamp for hashing
            };
            
            const hashString = Object.values(auditData).join('|');
            const hash = crypto.createHash('sha256').update(hashString).digest('hex');

            const audit = new AdminAudit({
                adminId,
                action,
                targetType,
                targetId,
                details,
                ipAddress,
                hash
            });
            await audit.save();
            return audit;
        } catch (error) {
            console.error('[AdminAuditService] Error writing audit log:', error);
            // We do not fail the parent transaction if audit logging fails, but we log it.
        }
    }
    // â”€â”€â”€ SPRINT 33: ADMIN AUDIT CENTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async adminGetAudits(query = {}) {
        const { page = 1, limit = 50, action, targetType, adminId } = query;
        const filter = {};
        
        if (action) filter.action = action;
        if (targetType) filter.targetType = targetType;
        if (adminId) filter.adminId = adminId;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const audits = await AdminAudit.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('adminId', 'name email roleId'); // Assume some fields exist

        const total = await AdminAudit.countDocuments(filter);

        return {
            audits,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        };
    }

    static async adminGetAudit(id) {
        return await AdminAudit.findById(id).populate('adminId', 'name email');
    }

    static async adminSearchAudits(searchTerm) {
        const regex = new (require('mongoose').mongo.BSONRegExp)(searchTerm, 'i');
        // Search across action, targetType, or details stringified (rough search if details is mixed, usually better to search specific text fields)
        return await AdminAudit.find({
            $or: [
                { action: regex },
                { targetType: regex },
                { targetId: regex }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('adminId', 'name email');
    }

    static async adminFilterAudits(filters = {}) {
        return await this.adminGetAudits(filters);
    }

    static async adminTimeline(query = {}) {
        // Timeline is basically the same as getAudits but maybe focused on recent activities
        return await this.adminGetAudits({ ...query, limit: 100 });
    }

    static async adminRecentActivity(limit = 10) {
        return await AdminAudit.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('adminId', 'name email');
    }

    static async adminAuditAnalytics() {
        const totalActions = await AdminAudit.countDocuments();
        
        const topActions = await AdminAudit.aggregate([
            { $group: { _id: "$action", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const topModules = await AdminAudit.aggregate([
            { $group: { _id: "$targetType", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const actionsToday = await AdminAudit.countDocuments({ createdAt: { $gte: today } });

        return {
            totalActions,
            actionsToday,
            topActions,
            topModules
        };
    }

    static async adminExportAudits(filters = {}) {
        // Mock export logic - normally we'd stream CSV
        const audits = await AdminAudit.find(filters).sort({ createdAt: -1 }).limit(1000).populate('adminId', 'name email');
        
        // Return JSON representing export data, the controller could format it as CSV/PDF
        return {
            type: 'JSON',
            count: audits.length,
            data: audits
        };
    }
}

module.exports = AdminAuditService;
