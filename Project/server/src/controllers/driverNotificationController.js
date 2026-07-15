const DriverNotificationService = require('../services/driverNotificationService');
const ResponseFormatter = require('../utils/responseFormatter');

class DriverNotificationController {
    static async getNotifications(req, res) {
        const result = await DriverNotificationService.getNotifications(req.user.id, req.query);
        return ResponseFormatter.success(res, result, 'Notifications retrieved');
    }

    static async getUnreadNotifications(req, res) {
        const result = await DriverNotificationService.getUnreadNotifications(req.user.id, req.query);
        return ResponseFormatter.success(res, result, 'Unread notifications retrieved');
    }

    static async markAsRead(req, res) {
        const notification = await DriverNotificationService.markAsRead(req.params.id, req.user.id, req.app.get('io'));
        return ResponseFormatter.success(res, notification, 'Notification marked as read');
    }

    static async markAllAsRead(req, res) {
        const result = await DriverNotificationService.markAllAsRead(req.user.id, req.app.get('io'));
        return ResponseFormatter.success(res, result, 'All notifications marked as read');
    }

    static async deleteNotification(req, res) {
        const notification = await DriverNotificationService.deleteNotification(req.params.id, req.user.id, req.app.get('io'));
        return ResponseFormatter.success(res, notification, 'Notification deleted');
    }

    static async clearAllNotifications(req, res) {
        const result = await DriverNotificationService.clearAllNotifications(req.user.id, req.app.get('io'));
        return ResponseFormatter.success(res, result, 'All notifications cleared');
    }
}

module.exports = DriverNotificationController;
