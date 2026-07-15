const NotificationService = require('../services/notificationService');
const ResponseFormatter = require('../utils/responseFormatter');

class NotificationController {
    static async getNotifications(req, res) {
        const userId = req.user.userId || req.user.id;
        const result = await NotificationService.getNotifications(userId, req.query);
        return ResponseFormatter.success(res, result);
    }

    static async getUnreadCount(req, res) {
        const userId = req.user.userId || req.user.id;
        const count = await NotificationService.getUnreadCount(userId);
        return ResponseFormatter.success(res, { count });
    }

    static async markAsRead(req, res) {
        const userId = req.user.userId || req.user.id;
        const notification = await NotificationService.markAsRead(userId, req.params.id);
        return ResponseFormatter.success(res, { notification }, "Notification marked as read");
    }

    static async markAllRead(req, res) {
        const userId = req.user.userId || req.user.id;
        const result = await NotificationService.markAllRead(userId);
        return ResponseFormatter.success(res, result, "All notifications marked as read");
    }

    static async deleteNotification(req, res) {
        const userId = req.user.userId || req.user.id;
        await NotificationService.deleteNotification(userId, req.params.id);
        return ResponseFormatter.success(res, null, "Notification deleted");
    }

    static async clearAll(req, res) {
        const userId = req.user.userId || req.user.id;
        await NotificationService.clearAll(userId);
        return ResponseFormatter.success(res, null, "All notifications cleared");
    }
}

module.exports = NotificationController;
