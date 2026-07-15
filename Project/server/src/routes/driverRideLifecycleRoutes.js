const express = require('express');
const router = express.Router();
const DriverRideLifecycleController = require('../controllers/driverRideLifecycleController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');

router.use(authMiddleware);
router.use(requireRole('Driver'));

router.get('/', asyncWrapper(DriverRideLifecycleController.getActiveRide));
router.post('/:id/arrive', asyncWrapper(DriverRideLifecycleController.arriveAtPickup));
router.post('/:id/verify-otp', asyncWrapper(DriverRideLifecycleController.verifyOTP));
router.post('/:id/start', asyncWrapper(DriverRideLifecycleController.startRide));
router.put('/:id/location', asyncWrapper(DriverRideLifecycleController.updateLocation));
router.post('/:id/complete', asyncWrapper(DriverRideLifecycleController.completeRide));
router.post('/:id/cancel', asyncWrapper(DriverRideLifecycleController.cancelRide));

module.exports = router;
