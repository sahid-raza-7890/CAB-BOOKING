const TripHistoryService = require('../services/tripHistoryService');
const ResponseFormatter = require('../utils/responseFormatter');

class TripHistoryController {
    static async getRideHistory(req, res) {
        const userId = req.user.userId || req.user.id;
        const result = await TripHistoryService.getRideHistory(userId, req.query);
        result.debug_query = req.query;
        result.debug_userId = userId;
        result.debug_status = req.query.status;
        return ResponseFormatter.success(res, result);
    }

    static async getRideDetails(req, res) {
        const userId = req.user.userId || req.user.id;
        const ride = await TripHistoryService.getRideDetails(req.params.id, userId);
        return ResponseFormatter.success(res, ride);
    }

    static async generateInvoice(req, res) {
        const userId = req.user.userId || req.user.id;
        const invoice = await TripHistoryService.generateInvoice(req.params.id, userId);
        return ResponseFormatter.success(res, invoice);
    }

    static async rebookRide(req, res) {
        const userId = req.user.userId || req.user.id;
        const newRide = await TripHistoryService.rebookRide(req.params.id, userId, req.io);
        return ResponseFormatter.success(res, newRide, "Ride rebooked successfully");
    }

    static async attachSupportTicket(req, res) {
        const userId = req.user.userId || req.user.id;
        const ticket = await TripHistoryService.attachSupportTicket(req.params.id, userId, req.body, req.io);
        return ResponseFormatter.success(res, ticket, "Support ticket submitted successfully");
    }
}

module.exports = TripHistoryController;
