const DriverService = require('../services/driverService');
const ResponseFormatter = require('../utils/responseFormatter');

class DriverController {
    static async getDrivers(req, res) {
        const drivers = await DriverService.getAllDrivers();
        return ResponseFormatter.success(res, drivers);
    }

    static async getProfile(req, res) {
        const driverId = req.user.userId || req.user.id;
        const driver = await DriverService.getProfile(driverId);
        return ResponseFormatter.success(res, driver);
    }

    static async updateProfile(req, res) {
        const driverId = req.user.userId || req.user.id;
        const driver = await DriverService.updateProfile(driverId, req.body);
        return ResponseFormatter.success(res, driver, 'Profile updated successfully!');
    }

    static async updateBanking(req, res) {
        const driverId = req.user.userId || req.user.id;
        const bankingInfo = await DriverService.updateBanking(driverId, req.body);
        return ResponseFormatter.success(res, bankingInfo, 'Banking info updated successfully!');
    }

    static async changeAvatar(req, res) {
        const driverId = req.user.userId || req.user.id;
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image uploaded' });
        }
        const avatarUrl = req.file.path;
        const driver = await DriverService.changeAvatar(driverId, avatarUrl);
        return ResponseFormatter.success(res, driver, 'Avatar updated successfully!');
    }

    static async deleteAvatar(req, res) {
        const driverId = req.user.userId || req.user.id;
        await DriverService.deleteAvatar(driverId);
        return ResponseFormatter.success(res, {}, 'Avatar deleted successfully!');
    }

    static async updateSchedule(req, res) {
        const driverId = req.user.userId || req.user.id;
        const schedule = await DriverService.updateSchedule(driverId, req.body.availabilitySchedule);
        return ResponseFormatter.success(res, schedule, 'Schedule updated successfully!');
    }

    static async updateDocuments(req, res) {
        const driverId = req.user.userId || req.user.id;
        const documents = await DriverService.updateDocuments(driverId, req.body.documents);
        return ResponseFormatter.success(res, documents, 'Documents updated successfully!');
    }
}

module.exports = DriverController;
