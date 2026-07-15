const SupportService = require('../services/supportService');
const ResponseFormatter = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

class AdminSupportController {
    static getTickets = asyncWrapper(async (req, res) => {
        const tickets = await SupportService.adminGetTickets();
        return ResponseFormatter.successAdmin(res, tickets, 'Support tickets retrieved successfully');
    });

    static getTicket = asyncWrapper(async (req, res) => {
        const ticket = await SupportService.adminGetTicket(req.params.id);
        return ResponseFormatter.successAdmin(res, ticket, 'Ticket details retrieved successfully');
    });

    static assignTicket = asyncWrapper(async (req, res) => {
        const ticket = await SupportService.adminAssignTicket(req.params.id, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, ticket, 'Ticket assigned successfully');
    });

    static replyTicket = asyncWrapper(async (req, res) => {
        const { message } = req.body;
        const ticket = await SupportService.adminReplyTicket(req.params.id, req.user.id, message, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, ticket, 'Reply added successfully');
    });

    static closeTicket = asyncWrapper(async (req, res) => {
        const ticket = await SupportService.adminCloseTicket(req.params.id, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, ticket, 'Ticket closed successfully');
    });

    static reopenTicket = asyncWrapper(async (req, res) => {
        const ticket = await SupportService.adminReopenTicket(req.params.id, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, ticket, 'Ticket reopened successfully');
    });

    static supportAnalytics = asyncWrapper(async (req, res) => {
        const analytics = await SupportService.adminSupportAnalytics();
        return ResponseFormatter.successAdmin(res, analytics, 'Support analytics retrieved successfully');
    });

    // â”€â”€â”€ SPRINT 39: KNOWLEDGE BASE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static createFAQ = asyncWrapper(async (req, res) => {
        const faq = await SupportService.adminCreateFAQ(req.body, req.user.id, req.ip);
        return ResponseFormatter.successAdmin(res, faq, 'FAQ created successfully');
    });

    static createHelpArticle = asyncWrapper(async (req, res) => {
        const article = await SupportService.adminCreateHelpArticle(req.body, req.user.id, req.ip);
        return ResponseFormatter.successAdmin(res, article, 'Help article created successfully');
    });
}

module.exports = AdminSupportController;
