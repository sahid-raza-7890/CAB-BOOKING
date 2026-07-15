const express = require('express');
const router = express.Router();
const SystemController = require('../controllers/systemController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');
const { adminLimiter } = require('../middleware/rateLimiter');

// Protect all system routes to only Super Admins or Admins with system permissions
router.use(authMiddleware);
router.use(requireRole('Admin'));
router.use(requirePermission('view_system_health')); // assume permission exists or fallback
router.use(adminLimiter);

router.get('/status', asyncWrapper(SystemController.getStatus));
router.get('/security', asyncWrapper(SystemController.getSecurityAudit));
router.get('/logs', asyncWrapper(SystemController.getLogs));

router.get('/backups', asyncWrapper(SystemController.getBackups));
router.post('/backup', requirePermission('manage_backups'), asyncWrapper(SystemController.createBackup));
router.post('/restore', requirePermission('manage_backups'), asyncWrapper(SystemController.restoreBackup));

module.exports = router;
