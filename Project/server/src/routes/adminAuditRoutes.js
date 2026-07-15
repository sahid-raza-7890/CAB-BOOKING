const express = require('express');
const router = express.Router();
const AdminAuditController = require('../controllers/adminAuditController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireRole('Admin'));

// Custom specific paths FIRST
router.get('/dashboard', AdminAuditController.dashboard);
router.get('/search', AdminAuditController.search);
router.get('/analytics', AdminAuditController.analytics);
router.get('/timeline', AdminAuditController.timeline);
router.get('/export', AdminAuditController.export);

// General CRUD paths LAST
router.get('/', AdminAuditController.list);
router.get('/:id', AdminAuditController.details);

module.exports = router;
