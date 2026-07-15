const DriverSessionService = require('../services/driverSessionService');
const ResponseFormatter = require('../utils/responseFormatter');

class DriverStatusController {
    static async updateStatus(req, res) {
        const { userId } = req.user; // Authenticated driver
        const { isOnline } = req.body;

        let session;
        if (isOnline) {
            session = await DriverSessionService.goOnline(userId);
        } else {
            session = await DriverSessionService.goOffline(userId);
        }

        return ResponseFormatter.success(res, { session }, 200);
    }

    static async heartbeat(req, res) {
        const { userId } = req.user;
        const payload = req.body; // e.g. { lat, lng, heading, speed, batteryLevel, isAvailable }

        const session = await DriverSessionService.heartbeat(userId, payload);
        
        return ResponseFormatter.success(res, { session }, 200);
    }
}

module.exports = DriverStatusController;
