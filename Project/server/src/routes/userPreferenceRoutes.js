const express = require('express');
const router = express.Router();
const userPreferenceController = require('../controllers/userPreferenceController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');

// Protect all preference routes
router.use(authMiddleware);
router.use(requireRole('Passenger'));

router.get('/', asyncWrapper(userPreferenceController.getPreferences));
router.put('/', asyncWrapper(userPreferenceController.updatePreferences));
router.put('/theme', asyncWrapper(userPreferenceController.updateTheme));
router.put('/language', asyncWrapper(userPreferenceController.updateLanguage));
router.put('/notifications', asyncWrapper(userPreferenceController.updateNotifications));
router.put('/privacy', asyncWrapper(userPreferenceController.updatePrivacy));
router.put('/ride', asyncWrapper(userPreferenceController.updateRidePreferences));
router.put('/security', asyncWrapper(userPreferenceController.updateSecurity));
router.post('/reset', asyncWrapper(userPreferenceController.resetPreferences));

module.exports = router;
