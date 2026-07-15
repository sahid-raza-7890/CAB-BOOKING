// â”€â”€â”€ adminRideRoutes.js â€” UCAB Enterprise â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Route definitions only. No business logic, no DB queries.

const express       = require('express');
const router        = express.Router();
const AdminRideController = require('../controllers/adminRideController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole    = require('../middleware/roleMiddleware');

// Every admin ride endpoint requires a valid admin token.
router.use(authMiddleware, requireRole('Admin'));

// â”€â”€ Ride list & detail â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/',    AdminRideController.listRides);
router.get('/:id', AdminRideController.getRide);

// â”€â”€ Ride actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/:id/assign',   AdminRideController.assignDriver);
router.post('/:id/cancel',   AdminRideController.cancelRide);
router.post('/:id/complete', AdminRideController.forceComplete);
router.post('/:id/refund',   AdminRideController.triggerRefund);

module.exports = router;
