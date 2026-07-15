const express = require('express');
const router = express.Router();
const DriverPreferenceController = require('../controllers/driverPreferenceController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');

router.use(authMiddleware);
router.use(requireRole('Driver'));

router.get('/', asyncWrapper(DriverPreferenceController.getPreferences));
router.put('/', asyncWrapper(DriverPreferenceController.updatePreferences));
router.put('/theme', asyncWrapper(DriverPreferenceController.updateTheme));
router.put('/language', asyncWrapper(DriverPreferenceController.updateLanguage));
router.put('/notifications', asyncWrapper(DriverPreferenceController.updateNotifications));
router.put('/privacy', asyncWrapper(DriverPreferenceController.updatePrivacy));
router.put('/navigation', asyncWrapper(DriverPreferenceController.updateNavigation));
router.put('/rides', asyncWrapper(DriverPreferenceController.updateRides));
router.put('/availability', asyncWrapper(DriverPreferenceController.updateAvailability));
router.put('/security', asyncWrapper(DriverPreferenceController.updateSecurity));
router.put('/map', asyncWrapper(DriverPreferenceController.updateMapProvider));
router.put('/voice', asyncWrapper(DriverPreferenceController.updateVoiceNavigation));
router.delete('/reset', asyncWrapper(DriverPreferenceController.resetPreferences));

module.exports = router;
