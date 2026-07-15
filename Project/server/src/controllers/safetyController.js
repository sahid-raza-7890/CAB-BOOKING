const SafetyService = require('../services/safetyService');
const ResponseFormatter = require('../utils/responseFormatter');

class SafetyController {
    static async getAlerts(req, res) {
        const userId = req.user.userId || req.user.id;
        const result = await SafetyService.getAlerts(userId);
        return ResponseFormatter.success(res, result);
    }

    static async getAlert(req, res) {
        const userId = req.user.userId || req.user.id;
        const result = await SafetyService.getAlert(req.params.id, userId);
        return ResponseFormatter.success(res, result);
    }

    static async createAlert(req, res) {
        const userId = req.user.userId || req.user.id;
        const io = req.app.get('io');
        const result = await SafetyService.createAlert(userId, req.body, io);
        return ResponseFormatter.success(res, result, "Safety alert triggered successfully.");
    }

    static async cancelAlert(req, res) {
        const userId = req.user.userId || req.user.id;
        const io = req.app.get('io');
        const result = await SafetyService.cancelAlert(req.params.id, userId, io);
        return ResponseFormatter.success(res, result, "Safety alert cancelled.");
    }

    static async resolveAlert(req, res) {
        const userId = req.user.userId || req.user.id;
        const io = req.app.get('io');
        const result = await SafetyService.resolveAlert(req.params.id, userId, io);
        return ResponseFormatter.success(res, result, "Safety alert resolved.");
    }

    static async shareLiveRide(req, res) {
        const userId = req.user.userId || req.user.id;
        const result = await SafetyService.shareLiveRide(req.body.rideId, userId, req.body);
        return ResponseFormatter.success(res, result, "Live ride shared successfully.");
    }

    // â”€â”€â”€ SPRINT 39 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async getEmergencyContacts(req, res) {
        const userId = req.user.userId || req.user.id;
        const contacts = await SafetyService.getEmergencyContacts(userId);
        return ResponseFormatter.success(res, { contacts });
    }

    static async updateEmergencyContacts(req, res) {
        const userId = req.user.userId || req.user.id;
        const contacts = await SafetyService.updateEmergencyContacts(userId, req.body.contacts);
        return ResponseFormatter.success(res, { contacts }, 'Emergency contacts updated.');
    }

    static async getSafetyTimeline(req, res) {
        const userId = req.user.userId || req.user.id;
        const timeline = await SafetyService.getSafetyTimeline(userId);
        return ResponseFormatter.success(res, { timeline });
    }

    static async reportIncident(req, res) {
        const userId = req.user.userId || req.user.id;
        const io = req.app.get('io');
        const report = await SafetyService.reportIncident(userId, req.body, io);
        return ResponseFormatter.success(res, { report }, 'Incident reported successfully.', 201);
    }
}

module.exports = SafetyController;
