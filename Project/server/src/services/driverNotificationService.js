const NotificationService = require('./notificationService');
const UserPreference = require('../models/UserPreference');
const Notification = require('../models/Notification');

class DriverNotificationService {
    static async getNotifications(driverId, query = {}) {
        const result = await NotificationService.getNotifications(driverId, { ...query, userType: 'Driver' });
        // The underlying service might not filter by userType perfectly if it only uses userId.
        // We will filter in memory or modify the result, but typically userId is unique enough.
        // However, to be strict we should probably ensure it's driver notifications.
        return result;
    }

    static async getUnreadNotifications(driverId, query = {}) {
        return await NotificationService.getNotifications(driverId, { ...query, unreadOnly: true, userType: 'Driver' });
    }

    static async markAsRead(notificationId, driverId, io) {
        const notification = await NotificationService.markAsRead(driverId, notificationId);
        if (io) {
            io.to(`driver_${driverId}`).emit('notificationUpdated', {
                event: 'notification:updated',
                data: notification
            });
        }
        return notification;
    }

    static async markAllAsRead(driverId, io) {
        const result = await NotificationService.markAllRead(driverId);
        if (io) {
            io.to(`driver_${driverId}`).emit('notificationUpdated', {
                event: 'notification:all_read'
            });
        }
        return result;
    }

    static async deleteNotification(notificationId, driverId, io) {
        const notification = await NotificationService.deleteNotification(driverId, notificationId);
        if (io) {
            io.to(`driver_${driverId}`).emit('notificationDeleted', {
                event: 'notification:deleted',
                data: { id: notificationId }
            });
        }
        return notification;
    }

    static async clearAllNotifications(driverId, io) {
        const result = await NotificationService.clearAll(driverId);
        if (io) {
            io.to(`driver_${driverId}`).emit('notificationDeleted', {
                event: 'notification:all_deleted'
            });
        }
        return result;
    }

    static async getNotificationPreferences(driverId) {
        let prefs = await UserPreference.findOne({ userId: driverId });
        if (!prefs) {
            prefs = new UserPreference({ userId: driverId });
            await prefs.save();
        }
        return prefs.notificationPreferences;
    }

    static async updateNotificationPreferences(driverId, payload, io) {
        let prefs = await UserPreference.findOne({ userId: driverId });
        if (!prefs) {
            prefs = new UserPreference({ userId: driverId });
        }
        
        prefs.notificationPreferences = {
            ...prefs.notificationPreferences,
            ...payload
        };
        await prefs.save();
        return prefs.notificationPreferences;
    }
}

module.exports = DriverNotificationService;
