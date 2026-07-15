const Notification = require('../models/Notification');

class NotificationService {
    /**
     * Creates a new notification and broadcasts it via Socket.IO
     */
    static async createNotification({ userId, userType = 'Passenger', title, description, type, category, priority, icon, actionUrl, metadata }, io) {
        if (!userId || !title || !description || !type) {
            throw new Error("Missing required notification fields");
        }

        const notification = new Notification({
            userId,
            userType,
            title,
            description,
            type,
            category: category || 'System',
            priority: priority || 'Normal',
            icon: icon || 'bell',
            actionUrl: actionUrl || '',
            metadata: metadata || {}
        });

        await notification.save();

        if (io) {
            // Emit to specific user's notification room (e.g. notification_user123)
            io.emit(`notification_${userId}`, {
                event: 'notification:new',
                data: notification
            });
        }

        // --- Sprint 38: Email/SMS Stubs ---
        // In a real application, check user.preferences to see if they want Email/SMS
        // If they do, push to a background queue (e.g., BullMQ) for processing.
        if (priority === 'High' || priority === 'Urgent') {


        }

        return notification;
    }

    /**
     * Gets paginated notifications for a user
     */
    static async getNotifications(userId, { page = 1, limit = 20, category, unreadOnly }) {
        const query = { userId };
        
        if (category && category !== 'All') {
            query.category = category;
        }
        if (unreadOnly === 'true' || unreadOnly === true) {
            query.read = false;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await Notification.countDocuments(query);
        const unreadCount = await this.getUnreadCount(userId);

        return {
            notifications,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            unreadCount
        };
    }

    /**
     * Gets total unread notification count for a user
     */
    static async getUnreadCount(userId) {
        return await Notification.countDocuments({ userId, read: false });
    }

    /**
     * Marks a specific notification as read
     */
    static async markAsRead(userId, notificationId) {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { read: true },
            { new: true }
        );
        if (!notification) throw new Error("Notification not found");
        return notification;
    }

    /**
     * Marks all notifications as read for a user
     */
    static async markAllRead(userId) {
        const result = await Notification.updateMany(
            { userId, read: false },
            { read: true }
        );
        return { matched: result.matchedCount, modified: result.modifiedCount };
    }

    /**
     * Deletes a specific notification
     */
    static async deleteNotification(userId, notificationId) {
        const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });
        if (!notification) throw new Error("Notification not found");
        return notification;
    }

    /**
     * Clears all notifications for a user
     */
    static async clearAll(userId) {
        const result = await Notification.deleteMany({ userId });
        return { deletedCount: result.deletedCount };
    }

    // â”€â”€â”€ ADMIN METHODS (Sprint 31) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async adminDashboard() {
        const totalSent = await Notification.countDocuments();
        const readCount = await Notification.countDocuments({ read: true });
        
        // Basic aggregation for types
        const typesAggr = await Notification.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);
        
        const types = typesAggr.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        return {
            totalSent,
            readRate: totalSent ? (readCount / totalSent) * 100 : 0,
            activeCampaigns: 0, // Placeholder
            types
        };
    }

    static async adminGetNotifications(query = {}) {
        const { page = 1, limit = 50, type, target } = query;
        const filter = {};
        if (type && type !== 'All') filter.type = type;
        if (target && target !== 'All') filter.userType = target;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Notification.countDocuments(filter);

        return {
            notifications,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        };
    }

    static async adminGetNotification(id) {
        return await Notification.findById(id);
    }

    static async adminCreateNotification(payload, adminId, ipAddress, io) {
        const notification = new Notification(payload);
        await notification.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'CREATE_NOTIFICATION',
            targetType: 'Notification',
            targetId: notification._id,
            details: { type: payload.type, target: payload.userType },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('notificationCreated', notification);
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return notification;
    }

    static async adminUpdateNotification(id, payload, adminId, ipAddress, io) {
        const notification = await Notification.findByIdAndUpdate(id, payload, { new: true });
        if (!notification) throw new Error('Notification not found');

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'UPDATE_NOTIFICATION',
            targetType: 'Notification',
            targetId: notification._id,
            details: { type: notification.type },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('notificationUpdated', notification);
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return notification;
    }

    static async adminDeleteNotification(id, adminId, ipAddress, io) {
        const notification = await Notification.findByIdAndDelete(id);
        if (!notification) throw new Error('Notification not found');

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'DELETE_NOTIFICATION',
            targetType: 'Notification',
            targetId: notification._id,
            details: { type: notification.type },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('notificationDeleted', { id });
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return { deleted: true };
    }

    static async adminBroadcast(payload, adminId, ipAddress, io) {
        // Mock broadcasting logic
        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'SEND_BROADCAST',
            targetType: 'System',
            targetId: adminId,
            details: { type: payload.type, channel: payload.channel },
            ipAddress
        });

        if (io) {
            io.emit('broadcast', payload);
            io.to('admin_global').emit('notificationSent', { target: 'All Users', payload });
            io.to('admin_global').emit('admin_dashboard_update');
        }
        return { success: true, message: 'Broadcast sent' };
    }

    static async adminSendDrivers(payload, adminId, ipAddress, io) {
        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'SEND_DRIVER_NOTIFICATION',
            targetType: 'System',
            targetId: adminId,
            details: { type: payload.type, channel: payload.channel },
            ipAddress
        });

        if (io) {
            io.to('drivers').emit('notification:new', payload);
            io.to('admin_global').emit('notificationSent', { target: 'All Drivers', payload });
        }
        return { success: true, message: 'Sent to drivers' };
    }

    static async adminSendPassengers(payload, adminId, ipAddress, io) {
        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'SEND_PASSENGER_NOTIFICATION',
            targetType: 'System',
            targetId: adminId,
            details: { type: payload.type, channel: payload.channel },
            ipAddress
        });

        if (io) {
            io.to('passengers').emit('notification:new', payload);
            io.to('admin_global').emit('notificationSent', { target: 'All Passengers', payload });
        }
        return { success: true, message: 'Sent to passengers' };
    }

    static async adminSchedule(payload, adminId, ipAddress, io) {
        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'SCHEDULE_NOTIFICATION',
            targetType: 'System',
            targetId: adminId,
            details: { scheduledTime: payload.scheduledTime },
            ipAddress
        });
        
        if (io) {
            io.to('admin_global').emit('notificationScheduled', payload);
        }
        return { success: true, message: 'Scheduled' };
    }

    static async adminCancelSchedule(id, adminId, ipAddress, io) {
        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'CANCEL_SCHEDULE_NOTIFICATION',
            targetType: 'System',
            targetId: adminId,
            details: { id },
            ipAddress
        });
        return { success: true, message: 'Schedule cancelled' };
    }

    static async adminTemplates() {
        const NotificationTemplate = require('../models/NotificationTemplate');
        return await NotificationTemplate.find();
    }

    static async adminCreateTemplate(payload, adminId) {
        const NotificationTemplate = require('../models/NotificationTemplate');
        payload.createdBy = adminId;
        const tpl = new NotificationTemplate(payload);
        return await tpl.save();
    }

    static async adminUpdateTemplate(id, payload) {
        const NotificationTemplate = require('../models/NotificationTemplate');
        return await NotificationTemplate.findByIdAndUpdate(id, payload, { new: true });
    }

    static async adminDeleteTemplate(id) {
        const NotificationTemplate = require('../models/NotificationTemplate');
        return await NotificationTemplate.findByIdAndDelete(id);
    }
}

module.exports = NotificationService;
