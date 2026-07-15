const express = require('express');
const router = express.Router();
const DriverAvailabilityController = require('../controllers/driverAvailabilityController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');

router.use(authMiddleware);
router.use(requireRole('Driver'));

router.get('/', asyncWrapper(DriverAvailabilityController.getAvailability));
router.put('/online', asyncWrapper(DriverAvailabilityController.goOnline));
router.put('/offline', asyncWrapper(DriverAvailabilityController.goOffline));
router.put('/break', asyncWrapper(DriverAvailabilityController.startBreak));
router.put('/resume', asyncWrapper(DriverAvailabilityController.endBreak));
router.put('/preferences', asyncWrapper(DriverAvailabilityController.updateDispatchPreferences));
router.put('/destination', asyncWrapper(DriverAvailabilityController.updateDestinationFilter));

module.exports = router;
