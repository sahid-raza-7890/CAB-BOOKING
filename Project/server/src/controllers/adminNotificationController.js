const NotificationService = require('../services/notificationService');
const ResponseFormatter = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

class AdminNotificationController {
    static getDashboard = asyncWrapper(async (req, res) => {
        const dashboard = await NotificationService.adminDashboard();
        return ResponseFormatter.successAdmin(res, dashboard, 'Notification dashboard retrieved');
    });

    static getNotifications = asyncWrapper(async (req, res) => {
        const data = await NotificationService.adminGetNotifications(req.query);
        return ResponseFormatter.successAdmin(res, data, 'Notifications retrieved');
    });

    static getNotification = asyncWrapper(async (req, res) => {
        const data = await NotificationService.adminGetNotification(req.params.id);
        return ResponseFormatter.successAdmin(res, data, 'Notification retrieved');
    });

    static createNotification = asyncWrapper(async (req, res) => {
        const data = await NotificationService.adminCreateNotification(req.body, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, data, 'Notification created');
    });

    static updateNotification = asyncWrapper(async (req, res) => {
        const data = await NotificationService.adminUpdateNotification(req.params.id, req.body, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, data, 'Notification updated');
    });

    static deleteNotification = asyncWrapper(async (req, res) => {
        const data = await NotificationService.adminDeleteNotification(req.params.id, req.body, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, data, 'Notification deleted');
    });

    static sendBroadcast = asyncWrapper(async (req, res) => {
        const data = await NotificationService.adminBroadcast(req.body, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, data, 'Broadcast sent');
    });

    static sendToDrivers = asyncWrapper(async (req, res) => {
        const data = await NotificationService.adminSendDrivers(req.body, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, data, 'Sent to drivers');
    });

    static sendToPassengers = asyncWrapper(async (req, res) => {
        const data = await NotificationService.adminSendPassengers(req.body, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, data, 'Sent to passengers');
    });

    static scheduleNotification = asyncWrapper(async (req, res) => {
        const data = await NotificationService.adminSchedule(req.body, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, data, 'Notification scheduled');
    });

    static cancelScheduled = asyncWrapper(async (req, res) => {
        const data = await NotificationService.adminCancelSchedule(req.params.id, req.user.id, req.ip, req.app.get('io'));
        return ResponseFormatter.successAdmin(res, data, 'Scheduled notification cancelled');
    });

    static getTemplates = asyncWrapper(async (req, res) => {
        const data = await NotificationService.adminTemplates();
        return ResponseFormatter.successAdmin(res, data, 'Templates retrieved');
    });

    static createTemplate = asyncWrapper(async (req, res) => {
        const data = await NotificationService.adminCreateTemplate(req.body, req.user.id);
        return ResponseFormatter.successAdmin(res, data, 'Template created');
    });

    static updateTemplate = asyncWrapper(async (req, res) => {
        const data = await NotificationService.adminUpdateTemplate(req.params.id, req.body);
        return ResponseFormatter.successAdmin(res, data, 'Template updated');
    });

    static deleteTemplate = asyncWrapper(async (req, res) => {
        const data = await NotificationService.adminDeleteTemplate(req.params.id);
        return ResponseFormatter.successAdmin(res, data, 'Template deleted');
    });
}

module.exports = AdminNotificationController;
