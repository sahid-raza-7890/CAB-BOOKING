const DriverTripHistoryService = require('../services/driverTripHistoryService');

class DriverTripHistoryController {
    static async getTripHistory(req, res) {
        const options = {
            page: req.query.page,
            limit: req.query.limit,
            status: req.query.status,
            search: req.query.search,
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };
        const data = await DriverTripHistoryService.getTripHistory(req.user.id, options);
        res.json({ success: true, ...data });
    }

    static async getTripDetails(req, res) {
        const data = await DriverTripHistoryService.getTripDetails(req.params.id, req.user.id);
        res.json({ success: true, data });
    }

    static async getTripInvoice(req, res) {
        const data = await DriverTripHistoryService.getTripInvoice(req.params.id, req.user.id);
        res.json({ success: true, data });
    }

    static async getTripAnalytics(req, res) {
        const data = await DriverTripHistoryService.getTripAnalytics(req.user.id);
        res.json({ success: true, data });
    }
}

module.exports = DriverTripHistoryController;
