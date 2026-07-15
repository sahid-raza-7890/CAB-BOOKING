const SafetyService = require('../services/safetyService');
const SupportService = require('../services/supportService');
const ResponseFormatter = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

class AdminSafetyController {

    // GET /api/admin/safety/dashboard
    static getDashboard = asyncWrapper(async (req, res) => {
        const analytics = await SupportService.adminSupportAnalytics();
        return ResponseFormatter.successAdmin(res, analytics, 'Safety & support dashboard summary retrieved successfully');
    });

    // GET /api/admin/safety/alerts
    static getSafetyAlerts = asyncWrapper(async (req, res) => {
        const alerts = await SafetyService.adminGetAlerts();
        return ResponseFormatter.successAdmin(res, alerts, 'Safety alerts list retrieved successfully');
    });

    // GET /api/admin/safety/alerts/:id
    static getSafetyAlert = asyncWrapper(async (req, res) => {
        const alert = await SafetyService.adminGetAlert(req.params.id);
        return ResponseFormatter.successAdmin(res, alert, 'Safety alert details retrieved successfully');
    });

    // PUT /api/admin/safety/alerts/:id/resolve
    static resolveSafetyAlert = asyncWrapper(async (req, res) => {
        const { remarks } = req.body;
        const io = req.app.get('io');
        const alert = await SafetyService.adminResolveAlert(req.params.id, req.user._id, remarks, req.ip, io);
        return ResponseFormatter.successAdmin(res, alert, 'Safety alert resolved successfully');
    });

    // PUT /api/admin/safety/alerts/:id/escalate
    static escalateSafetyAlert = asyncWrapper(async (req, res) => {
        const { remarks } = req.body;
        const io = req.app.get('io');
        const alert = await SafetyService.adminEscalateAlert(req.params.id, req.user._id, remarks, req.ip, io);
        return ResponseFormatter.successAdmin(res, alert, 'Safety alert escalated successfully');
    });

    // PUT /api/admin/safety/alerts/:id/dismiss
    static dismissSafetyAlert = asyncWrapper(async (req, res) => {
        const { remarks } = req.body;
        const io = req.app.get('io');
        const alert = await SafetyService.adminDismissAlert(req.params.id, req.user._id, remarks, req.ip, io);
        return ResponseFormatter.successAdmin(res, alert, 'Safety alert dismissed successfully');
    });

    // GET /api/admin/safety/tickets
    static getSupportTickets = asyncWrapper(async (req, res) => {
        const tickets = await SupportService.adminGetTickets();
        return ResponseFormatter.successAdmin(res, tickets, 'Support tickets list retrieved successfully');
    });

    // GET /api/admin/safety/tickets/:id
    static getSupportTicket = asyncWrapper(async (req, res) => {
        const ticket = await SupportService.adminGetTicket(req.params.id);
        return ResponseFormatter.successAdmin(res, ticket, 'Support ticket details retrieved successfully');
    });

    // PUT /api/admin/safety/tickets/:id/assign
    static assignSupportTicket = asyncWrapper(async (req, res) => {
        const io = req.app.get('io');
        const ticket = await SupportService.adminAssignTicket(req.params.id, req.user._id, req.ip, io);
        return ResponseFormatter.successAdmin(res, ticket, 'Support ticket assigned successfully');
    });

    // POST /api/admin/safety/tickets/:id/reply
    static replySupportTicket = asyncWrapper(async (req, res) => {
        const { message } = req.body;
        if (!message) {
            return ResponseFormatter.error(res, 'Reply message cannot be empty', 'VALIDATION_ERROR', {}, 400);
        }
        const io = req.app.get('io');
        const ticket = await SupportService.adminReplyTicket(req.params.id, req.user._id, message, req.ip, io);
        return ResponseFormatter.successAdmin(res, ticket, 'Reply added to ticket successfully');
    });

    // PUT /api/admin/safety/tickets/:id/close
    static closeSupportTicket = asyncWrapper(async (req, res) => {
        const io = req.app.get('io');
        const ticket = await SupportService.adminCloseTicket(req.params.id, req.user._id, req.ip, io);
        return ResponseFormatter.successAdmin(res, ticket, 'Support ticket closed successfully');
    });

    // PUT /api/admin/safety/tickets/:id/reopen
    static reopenSupportTicket = asyncWrapper(async (req, res) => {
        const io = req.app.get('io');
        const ticket = await SupportService.adminReopenTicket(req.params.id, req.user._id, req.ip, io);
        return ResponseFormatter.successAdmin(res, ticket, 'Support ticket reopened successfully');
    });

    // GET /api/admin/safety/analytics
    static getSupportAnalytics = asyncWrapper(async (req, res) => {
        const analytics = await SupportService.adminSupportAnalytics();
        return ResponseFormatter.successAdmin(res, analytics, 'Support analytics aggregated successfully');
    });
}

module.exports = AdminSafetyController;
