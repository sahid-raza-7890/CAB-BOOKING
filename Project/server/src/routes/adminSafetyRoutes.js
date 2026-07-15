const express = require('express');
const router = express.Router();
const AdminSafetyController = require('../controllers/adminSafetyController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Enforce Admin credentials
router.use(authMiddleware, requireRole('Admin'));

// Dashboard summary stats
router.get('/dashboard', AdminSafetyController.getDashboard);

// Safety alerts CRUD
router.get('/alerts', AdminSafetyController.getSafetyAlerts);
router.get('/alerts/:id', AdminSafetyController.getSafetyAlert);
router.put('/alerts/:id/resolve', AdminSafetyController.resolveSafetyAlert);
router.put('/alerts/:id/escalate', AdminSafetyController.escalateSafetyAlert);
router.put('/alerts/:id/dismiss', AdminSafetyController.dismissSafetyAlert);

// Support tickets CRUD
router.get('/tickets', AdminSafetyController.getSupportTickets);
router.get('/tickets/:id', AdminSafetyController.getSupportTicket);
router.put('/tickets/:id/assign', AdminSafetyController.assignSupportTicket);
router.post('/tickets/:id/reply', AdminSafetyController.replySupportTicket);
router.put('/tickets/:id/close', AdminSafetyController.closeSupportTicket);
router.put('/tickets/:id/reopen', AdminSafetyController.reopenSupportTicket);

// Analytics compilation
router.get('/analytics', AdminSafetyController.getSupportAnalytics);

module.exports = router;
