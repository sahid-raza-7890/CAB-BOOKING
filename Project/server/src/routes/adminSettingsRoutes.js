const express = require('express');
const router = express.Router();
const AdminSettingsController = require('../controllers/adminSettingsController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireRole('Admin'));

// GET /api/admin/settings
router.get('/', AdminSettingsController.getAllSettings);

// POST /api/admin/settings (create)
router.post('/', AdminSettingsController.createSetting);

// GET /api/admin/settings/:category
router.get('/:category', AdminSettingsController.getCategory);

// PUT /api/admin/settings (bulk)
// Order matters: must be before /:key
router.put('/', AdminSettingsController.bulkUpdate);

// PUT /api/admin/settings/:key
router.put('/:key', AdminSettingsController.updateSetting);

// POST /api/admin/settings/reset
// Order matters: must be before /reset/:category
router.post('/reset', AdminSettingsController.resetAll);

// POST /api/admin/settings/reset/:category
router.post('/reset/:category', AdminSettingsController.resetCategory);

module.exports = router;
