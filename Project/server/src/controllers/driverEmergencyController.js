const SafetyService = require('../services/safetyService');
const DriverEmergencyService = require('../services/driverEmergencyService');
const ResponseFormatter = require('../utils/responseFormatter');

class DriverEmergencyController {
    static async triggerSOS(req, res) {
        const driverId = req.user.userId || req.user.id;
        const io = req.app.get('io');
        const alert = await DriverEmergencyService.triggerSOS(driverId, req.body, io);
        return ResponseFormatter.success(res, { alert }, 'SOS activated.', 201);
    }

    static async cancelSOS(req, res) {
        const driverId = req.user.userId || req.user.id;
        const io = req.app.get('io');
        const alert = await DriverEmergencyService.cancelSOS(driverId, io);
        return ResponseFormatter.success(res, { alert }, 'SOS cancelled.');
    }

    static async shareLiveLocation(req, res) {
        const driverId = req.user.userId || req.user.id;
        const io = req.app.get('io');
        const result = await DriverEmergencyService.shareLiveLocation(driverId, req.body, io);
        return ResponseFormatter.success(res, result);
    }

    // â”€â”€â”€ SPRINT 39: Driver Safety Completion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async reportBreakdown(req, res) {
        const driverId = req.user.userId || req.user.id;
        const io = req.app.get('io');
        const report = await SafetyService.reportBreakdown(driverId, req.body, io);
        return ResponseFormatter.success(res, { report }, 'Breakdown reported.', 201);
    }

    static async reportIncident(req, res) {
        const driverId = req.user.userId || req.user.id;
        const io = req.app.get('io');
        const report = await SafetyService.driverReportIncident(driverId, req.body, io);
        return ResponseFormatter.success(res, { report }, 'Incident reported.', 201);
    }

    static async reportUnsafePassenger(req, res) {
        const driverId = req.user.userId || req.user.id;
        const io = req.app.get('io');
        const report = await SafetyService.reportUnsafePassenger(driverId, req.body, io);
        return ResponseFormatter.success(res, { report }, 'Unsafe passenger reported.', 201);
    }

    static async getSafetyTimeline(req, res) {
        const driverId = req.user.userId || req.user.id;
        const timeline = await SafetyService.getDriverSafetyTimeline(driverId);
        return ResponseFormatter.success(res, { timeline });
    }
}

module.exports = DriverEmergencyController;
