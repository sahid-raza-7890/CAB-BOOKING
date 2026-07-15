const express = require('express');
const router = express.Router();
const DriverRideController = require('../controllers/driverRideController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');

router.post('/test-broadcast', (req, res) => {
    const io = req.app.get('io');
    io.of('/driver').emit('rideRequest', { dispatchId: 'test-broad', ride: { _id: 'ride123', pickupLocation: 'Broad Test A', dropoffLocation: 'Broad Test B', fare: 99, distanceKm: 5 }, expiresAt: new Date(Date.now() + 600000) });
    res.json({ success: true, message: 'Broadcast sent' });
});

router.use(authMiddleware);

router.use(requireRole('Driver'));
router.get('/pending', asyncWrapper(DriverRideController.getPendingRequests));
router.post('/:id/accept', asyncWrapper(DriverRideController.acceptRide));
router.post('/:id/reject', asyncWrapper(DriverRideController.rejectRide));
module.exports = router;
