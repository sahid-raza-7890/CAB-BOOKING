const express = require('express');
const router = express.Router();
const TripHistoryController = require('../controllers/tripHistoryController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireRole('Passenger'));

router.get('/', asyncWrapper(TripHistoryController.getRideHistory));
router.get('/:id', asyncWrapper(TripHistoryController.getRideDetails));
router.get('/:id/invoice', asyncWrapper(TripHistoryController.generateInvoice));
router.post('/:id/rebook', asyncWrapper(TripHistoryController.rebookRide));
router.post('/:id/support', asyncWrapper(TripHistoryController.attachSupportTicket));

module.exports = router;
