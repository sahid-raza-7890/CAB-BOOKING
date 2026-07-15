const SupportService = require('../services/supportService');
const ResponseFormatter = require('../utils/responseFormatter');

class SupportController {
    
    static async getTickets(req, res) {
        const userId = req.user.userId || req.user.id;
        const tickets = await SupportService.getTickets(userId);
        return ResponseFormatter.success(res, tickets);
    }

    static async getTicket(req, res) {
        const userId = req.user.userId || req.user.id;
        const ticketId = req.params.id;
        const ticket = await SupportService.getTicket(ticketId, userId);
        return ResponseFormatter.success(res, ticket);
    }

    static async createTicket(req, res) {
        const userId = req.user.userId || req.user.id;
        // The middleware sets req.user.role or similar, but since this router is Passenger only currently:
        const userType = req.user.role || 'Passenger'; 
        const userModel = 'User';

        // Assuming io is attached to req by a middleware (or we can import the Socket module if available globally)
        // For now, req.io is typical if configured, otherwise undefined is safe.
        const ticket = await SupportService.createTicket(userId, userType, userModel, req.body, req.io);
        return ResponseFormatter.success(res, ticket, "Ticket created successfully");
    }

    static async updateTicket(req, res) {
        const userId = req.user.userId || req.user.id;
        const ticketId = req.params.id;
        const ticket = await SupportService.updateTicket(ticketId, userId, req.body, req.io);
        return ResponseFormatter.success(res, ticket, "Ticket updated successfully");
    }

    static async replyTicket(req, res) {
        const userId = req.user.userId || req.user.id;
        const ticketId = req.params.id;
        const { message } = req.body;
        if (!message) return ResponseFormatter.error(res, "Message is required", 400);

        const ticket = await SupportService.replyTicket(ticketId, userId, 'User', message, req.io);
        return ResponseFormatter.success(res, ticket, "Reply added successfully");
    }

    static async closeTicket(req, res) {
        const userId = req.user.userId || req.user.id;
        const ticketId = req.params.id;
        const ticket = await SupportService.closeTicket(ticketId, userId, req.io);
        return ResponseFormatter.success(res, ticket, "Ticket closed successfully");
    }

    // â”€â”€â”€ SPRINT 39: KNOWLEDGE BASE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async getFAQs(req, res) {
        const targetAudience = req.query.audience || (req.user?.role || 'All');
        const faqs = await SupportService.getFAQs(targetAudience);
        return ResponseFormatter.success(res, { faqs });
    }

    static async getHelpArticles(req, res) {
        const targetAudience = req.query.audience || (req.user?.role || 'All');
        const articles = await SupportService.getHelpArticles(targetAudience);
        return ResponseFormatter.success(res, { articles });
    }

    static async readHelpArticle(req, res) {
        const article = await SupportService.readHelpArticle(req.params.id);
        return ResponseFormatter.success(res, { article });
    }
}

module.exports = SupportController;
