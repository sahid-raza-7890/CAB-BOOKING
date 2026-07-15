const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { generateLink, trackRide } = require('../controllers/rideSharingController');

const router = express.Router();

// Public route for tracking
router.get('/track/:token', trackRide);

// Protected route for generating link
router.use(authMiddleware);
router.post('/rides/:rideId/share', requireRole('User'), generateLink);

module.exports = router;
