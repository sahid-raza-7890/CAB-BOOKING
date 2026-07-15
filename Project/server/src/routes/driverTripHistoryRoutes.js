const express = require('express');
const router = express.Router();
const DriverTripHistoryController = require('../controllers/driverTripHistoryController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');

router.use(authMiddleware);
router.use(requireRole('Driver'));

router.get('/', asyncWrapper(DriverTripHistoryController.getTripHistory));
router.get('/analytics', asyncWrapper(DriverTripHistoryController.getTripAnalytics));
router.get('/:id', asyncWrapper(DriverTripHistoryController.getTripDetails));
router.get('/:id/invoice', asyncWrapper(DriverTripHistoryController.getTripInvoice));

module.exports = router;
