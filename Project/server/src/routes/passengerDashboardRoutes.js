const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { getDashboard } = require('../controllers/passengerDashboardController');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('User'));

router.get('/', getDashboard);

module.exports = router;
