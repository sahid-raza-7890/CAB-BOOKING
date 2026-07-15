const express = require('express');
const router = express.Router();
const DriverNotificationController = require('../controllers/driverNotificationController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');

router.use(authMiddleware);
router.use(requireRole('Driver'));

router.get('/', asyncWrapper(DriverNotificationController.getNotifications));
router.get('/unread', asyncWrapper(DriverNotificationController.getUnreadNotifications));
router.put('/read-all', asyncWrapper(DriverNotificationController.markAllAsRead));
router.put('/:id/read', asyncWrapper(DriverNotificationController.markAsRead));
router.delete('/:id', asyncWrapper(DriverNotificationController.deleteNotification));
router.delete('/', asyncWrapper(DriverNotificationController.clearAllNotifications));

module.exports = router;
