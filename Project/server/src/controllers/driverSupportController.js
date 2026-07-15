const DriverSupportService = require('../services/driverSupportService');
const ResponseFormatter = require('../utils/responseFormatter');

class DriverSupportController {
    static async getTickets(req, res) {
        const tickets = await DriverSupportService.getTickets(req.user.id);
        return ResponseFormatter.success(res, tickets, 'Tickets retrieved');
    }

    static async getTicket(req, res) {
        const ticket = await DriverSupportService.getTicket(req.params.id, req.user.id);
        return ResponseFormatter.success(res, ticket, 'Ticket retrieved');
    }

    static async createTicket(req, res) {
        const ticket = await DriverSupportService.createTicket(req.user.id, req.body, req.app.get('io'));
        return ResponseFormatter.success(res, ticket, 'Ticket created', 201);
    }

    static async replyToTicket(req, res) {
        const ticket = await DriverSupportService.replyToTicket(req.params.id, req.user.id, req.body.message, req.app.get('io'));
        return ResponseFormatter.success(res, ticket, 'Replied to ticket');
    }

    static async closeTicket(req, res) {
        const ticket = await DriverSupportService.closeTicket(req.params.id, req.user.id, req.app.get('io'));
        return ResponseFormatter.success(res, ticket, 'Ticket closed');
    }
}

module.exports = DriverSupportController;
