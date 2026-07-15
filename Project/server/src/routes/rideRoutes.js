const express = require('express');
const router = express.Router();
const RideController = require('../controllers/rideController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Fare Estimates (Public)
router.post('/fare-estimate', asyncWrapper(RideController.fareEstimate));
router.post('/rentals/fare-estimate', asyncWrapper(RideController.rentalFareEstimate));

// Passenger Actions
router.post('/request', authMiddleware, requireRole('Passenger', 'User'), asyncWrapper(RideController.requestRide));
router.post('/create', authMiddleware, requireRole('Passenger', 'User'), asyncWrapper(RideController.requestRide)); // Fallback alias
router.get('/scheduled', authMiddleware, requireRole('Passenger', 'User'), asyncWrapper(RideController.getScheduledRides));
router.put('/scheduled/:id', authMiddleware, requireRole('Passenger', 'User'), asyncWrapper(RideController.modifyScheduledRide));
router.put('/scheduled/:id/cancel', authMiddleware, requireRole('Passenger', 'User'), asyncWrapper(RideController.cancelScheduledRide));
router.post('/:id/rebook', authMiddleware, requireRole('Passenger', 'User'), asyncWrapper(RideController.rebookRide));
router.get('/my/active', authMiddleware, requireRole('Passenger', 'User'), asyncWrapper(RideController.getActiveRide));
router.get('/my', authMiddleware, requireRole('Passenger', 'User'), asyncWrapper(RideController.getMyRides));
router.put('/:id/cancel', authMiddleware, requireRole('Passenger', 'User'), asyncWrapper(RideController.cancelRide));
router.get('/:id', authMiddleware, requireRole('Passenger', 'User'), asyncWrapper(RideController.getRideDetails));
router.post('/:id/rating', authMiddleware, requireRole('Passenger', 'User'), asyncWrapper(RideController.rateRide));
router.post('/mask-call', authMiddleware, asyncWrapper(RideController.maskCall));
router.post('/:id/share', authMiddleware, requireRole('Passenger', 'User'), asyncWrapper(RideController.shareRide));

// Driver Actions
router.get('/pending', authMiddleware, requireRole('Driver'), asyncWrapper(RideController.getPendingRides));
router.put('/:id/accept', authMiddleware, requireRole('Driver'), asyncWrapper(RideController.acceptRide));
router.put('/:id/start', authMiddleware, requireRole('Driver', 'Passenger', 'Admin'), asyncWrapper(RideController.startRide));

// Shared Lifecycle Action (can be triggered by system, admin, or driver)
router.put('/:id/complete', authMiddleware, asyncWrapper(RideController.completeRide));

// Admin Actions
router.get('/', authMiddleware, requireRole('Admin'), asyncWrapper(RideController.getAllRides));
router.put('/:id/assign', authMiddleware, requireRole('Admin'), asyncWrapper(RideController.assignDriver));
router.delete('/cancel-ride', authMiddleware, requireRole('Admin'), asyncWrapper(RideController.deleteRideAsAdmin));

// Legacy un-prefixed aliases to preserve old API contract
router.post('/legacy-request-ride', authMiddleware, asyncWrapper(RideController.requestRide));
router.delete('/legacy-cancel-ride', authMiddleware, requireRole('Admin'), asyncWrapper(RideController.deleteRideAsAdmin));

module.exports = router;
