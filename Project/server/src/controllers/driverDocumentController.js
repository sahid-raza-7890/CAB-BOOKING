const DriverDocumentService = require('../services/driverDocumentService');
const ResponseFormatter = require('../utils/responseFormatter');

class DriverDocumentController {
    static async getDocuments(req, res) {
        const driverId = req.user.userId || req.user.id;
        const data = await DriverDocumentService.getDocuments(driverId);
        return ResponseFormatter.success(res, data);
    }

    static async getDocument(req, res) {
        const driverId = req.user.userId || req.user.id;
        const data = await DriverDocumentService.getDocument(req.params.id, driverId);
        return ResponseFormatter.success(res, data);
    }

    static async uploadDocument(req, res) {
        const driverId = req.user.userId || req.user.id;
        const io = req.app.get('io');
        const data = await DriverDocumentService.uploadDocument(driverId, req.body, io);
        return ResponseFormatter.success(res, data, 'Document uploaded successfully.', 201);
    }

    static async deleteDocument(req, res) {
        const driverId = req.user.userId || req.user.id;
        const io = req.app.get('io');
        const data = await DriverDocumentService.deleteDocument(req.params.id, driverId, io);
        return ResponseFormatter.success(res, data, 'Document deleted.');
    }

    static async getComplianceStatus(req, res) {
        const driverId = req.user.userId || req.user.id;
        const data = await DriverDocumentService.getComplianceStatus(driverId);
        return ResponseFormatter.success(res, data);
    }

    // â”€â”€â”€ SPRINT 39 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async renewDocument(req, res) {
        const driverId = req.user.userId || req.user.id;
        const io = req.app.get('io');
        const data = await DriverDocumentService.renewDocument(driverId, req.params.id, req.body, io);
        return ResponseFormatter.success(res, data, 'Document renewed and is pending verification.', 201);
    }

    static async triggerExpiryCheck(req, res) {
        // This is typically called by a cron job, but we expose an admin/system endpoint
        const io = req.app.get('io');
        const data = await DriverDocumentService.checkDocumentExpiry(io);
        return ResponseFormatter.success(res, data, 'Document expiry check completed.');
    }
}

module.exports = DriverDocumentController;
