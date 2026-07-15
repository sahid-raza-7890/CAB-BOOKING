const DriverAvailabilityService = require('../services/driverAvailabilityService');

class DriverAvailabilityController {
    static async getAvailability(req, res) {
        const data = await DriverAvailabilityService.getAvailability(req.user.id);
        res.json({ success: true, data });
    }

    static async getDispatchPreferences(req, res) {
        const data = await DriverAvailabilityService.getDispatchPreferences(req.user.id);
        res.json({ success: true, data });
    }

    static async goOnline(req, res) {
        const io = req.app.get('io');
        const data = await DriverAvailabilityService.goOnline(req.user.id, io);
        res.json({ success: true, data });
    }

    static async goOffline(req, res) {
        const io = req.app.get('io');
        const data = await DriverAvailabilityService.goOffline(req.user.id, io);
        res.json({ success: true, data });
    }

    static async startBreak(req, res) {
        const io = req.app.get('io');
        const data = await DriverAvailabilityService.startBreak(req.user.id, req.body, io);
        res.json({ success: true, data });
    }

    static async endBreak(req, res) {
        const io = req.app.get('io');
        const data = await DriverAvailabilityService.endBreak(req.user.id, io);
        res.json({ success: true, data });
    }

    static async updateDispatchPreferences(req, res) {
        const io = req.app.get('io');
        const data = await DriverAvailabilityService.updateDispatchPreferences(req.user.id, req.body, io);
        res.json({ success: true, data });
    }

    static async updateDestinationFilter(req, res) {
        const io = req.app.get('io');
        const data = await DriverAvailabilityService.updateDestinationFilter(req.user.id, req.body, io);
        res.json({ success: true, data });
    }
}

module.exports = DriverAvailabilityController;
