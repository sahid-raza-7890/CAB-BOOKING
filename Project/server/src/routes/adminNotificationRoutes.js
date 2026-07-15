const express = require('express');
const router = express.Router();
const AdminNotificationController = require('../controllers/adminNotificationController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireRole('Admin'));

// Custom specific paths FIRST
router.get('/dashboard', AdminNotificationController.getDashboard);
router.get('/templates', AdminNotificationController.getTemplates);
router.post('/templates', AdminNotificationController.createTemplate);
router.put('/templates/:id', AdminNotificationController.updateTemplate);
router.delete('/templates/:id', AdminNotificationController.deleteTemplate);

router.post('/broadcast', AdminNotificationController.sendBroadcast);
router.post('/drivers', AdminNotificationController.sendToDrivers);
router.post('/passengers', AdminNotificationController.sendToPassengers);

router.post('/schedule', AdminNotificationController.scheduleNotification);
router.post('/schedule/:id/cancel', AdminNotificationController.cancelScheduled);

// General CRUD paths LAST
router.get('/', AdminNotificationController.getNotifications);
router.get('/:id', AdminNotificationController.getNotification);
router.post('/', AdminNotificationController.createNotification);
router.put('/:id', AdminNotificationController.updateNotification);
router.delete('/:id', AdminNotificationController.deleteNotification);

module.exports = router;
