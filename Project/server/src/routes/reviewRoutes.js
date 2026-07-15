const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireRole('Passenger'));

router.post('/', asyncWrapper(ReviewController.submitReview));
router.get('/', asyncWrapper(ReviewController.getPassengerReviews));
router.get('/driver/:driverId', asyncWrapper(ReviewController.getDriverReviews));
router.get('/ride/:rideId', asyncWrapper(ReviewController.getReviewByRideId));
router.put('/:id', asyncWrapper(ReviewController.editReview));
router.delete('/:id', asyncWrapper(ReviewController.deleteReview));
router.post('/:id/report', asyncWrapper(ReviewController.reportReview));

module.exports = router;
