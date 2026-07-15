const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Apply auth and Passenger role globally to this router (as per sprint requirements)
router.use(authMiddleware);
router.use(requireRole('Passenger'));

router.get('/', asyncWrapper(NotificationController.getNotifications));
router.get('/unread-count', asyncWrapper(NotificationController.getUnreadCount));
router.put('/read-all', asyncWrapper(NotificationController.markAllRead));
router.put('/:id/read', asyncWrapper(NotificationController.markAsRead));
router.delete('/clear', asyncWrapper(NotificationController.clearAll));
router.delete('/:id', asyncWrapper(NotificationController.deleteNotification));

module.exports = router;
