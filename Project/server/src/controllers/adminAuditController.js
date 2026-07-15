const AdminAuditService = require('../services/adminAuditService');
const ResponseFormatter = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

class AdminAuditController {
    static dashboard = asyncWrapper(async (req, res) => {
        const analytics = await AdminAuditService.adminAuditAnalytics();
        const recentActivity = await AdminAuditService.adminRecentActivity(10);
        return ResponseFormatter.successAdmin(res, { analytics, recentActivity }, 'Audit Dashboard retrieved');
    });

    static list = asyncWrapper(async (req, res) => {
        const data = await AdminAuditService.adminGetAudits(req.query);
        return ResponseFormatter.successAdmin(res, data, 'Audits retrieved');
    });

    static details = asyncWrapper(async (req, res) => {
        const data = await AdminAuditService.adminGetAudit(req.params.id);
        return ResponseFormatter.successAdmin(res, data, 'Audit retrieved');
    });

    static search = asyncWrapper(async (req, res) => {
        const { q } = req.query;
        const data = await AdminAuditService.adminSearchAudits(q);
        return ResponseFormatter.successAdmin(res, data, 'Search results');
    });

    static analytics = asyncWrapper(async (req, res) => {
        const data = await AdminAuditService.adminAuditAnalytics();
        return ResponseFormatter.successAdmin(res, data, 'Audit analytics');
    });

    static timeline = asyncWrapper(async (req, res) => {
        const data = await AdminAuditService.adminTimeline(req.query);
        return ResponseFormatter.successAdmin(res, data, 'Timeline retrieved');
    });

    static export = asyncWrapper(async (req, res) => {
        const data = await AdminAuditService.adminExportAudits(req.query);
        return ResponseFormatter.successAdmin(res, data, 'Audits exported');
    });
}

module.exports = AdminAuditController;
