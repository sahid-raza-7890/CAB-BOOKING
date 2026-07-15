const express = require('express');
const router = express.Router();
const DriverReviewController = require('../controllers/driverReviewController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');

router.use(authMiddleware);
router.use(requireRole('Driver'));

router.get('/', asyncWrapper(DriverReviewController.getDriverReviews));
router.get('/summary', asyncWrapper(DriverReviewController.getDriverRatingSummary));
router.get('/:id', asyncWrapper(DriverReviewController.getDriverReview));
router.post('/:rideId/passenger', asyncWrapper(DriverReviewController.submitPassengerReview));

module.exports = router;
