const UserService = require('../services/userService');
const DriverService = require('../services/driverService');
const ResponseFormatter = require('../utils/responseFormatter');

class UserController {
    static async getProfile(req, res) {
        const userId = req.user.userId || req.user.id;
        const user = await UserService.getProfile(userId);
        return ResponseFormatter.success(res, user.toObject ? user.toObject() : user);
    }

    static async updateProfile(req, res) {
        const userId = req.user.userId || req.user.id;
        const user = await UserService.updateProfile(userId, req.body);
        return ResponseFormatter.success(res, { user }, 'Profile updated successfully!');
    }

    static async changeAvatar(req, res) {
        const userId = req.user.userId || req.user.id;
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image uploaded' });
        }
        const avatarUrl = req.file.path; // Assuming multer-storage-cloudinary
        const user = await UserService.changeAvatar(userId, avatarUrl);
        return ResponseFormatter.success(res, { user }, 'Avatar updated successfully!');
    }

    static async deleteAvatar(req, res) {
        const userId = req.user.userId || req.user.id;
        await UserService.deleteAvatar(userId);
        return ResponseFormatter.success(res, {}, 'Avatar deleted successfully!');
    }

    static async getPaymentSettings(req, res) {
        const userId = req.user.userId || req.user.id;
        const settings = await UserService.getPaymentSettings(userId);
        return ResponseFormatter.success(res, settings);
    }

    static async updatePaymentSettings(req, res) {
        const userId = req.user.userId || req.user.id;
        const result = await UserService.updatePaymentSettings(userId, req.body);
        return ResponseFormatter.success(res, result, 'Payment settings updated successfully!');
    }

    static async getPreferences(req, res) {
        const userId = req.user.userId || req.user.id;
        const user = await UserService.getProfile(userId);
        return ResponseFormatter.success(res, user.preferences || {});
    }

    static async updatePreferences(req, res) {
        const userId = req.user.userId || req.user.id;
        const preferences = await UserService.updatePreferences(userId, req.body);
        return ResponseFormatter.success(res, preferences, 'Preferences updated successfully!');
    }

    static async cashoutWallet(req, res) {
        // Assume logic handled in WalletService in the future, just dummy here as per original
        return ResponseFormatter.success(res, {}, 'Cashout successful. Funds transferred.');
    }

    static async getAllUsers(req, res) {
        const users = await UserService.getAllUsers();
        return res.status(200).json(users);
    }

    static async getAllDrivers(req, res) {
        const drivers = await DriverService.getAllDrivers();
        return res.status(200).json(drivers);
    }
}

module.exports = UserController;
