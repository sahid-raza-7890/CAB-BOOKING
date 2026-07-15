const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');
const DriverIncentiveController = require('../controllers/driverIncentiveController');
const requireRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireRole('Driver'));

// â”€â”€â”€ GET /api/driver/incentives/active â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/active', asyncWrapper(DriverIncentiveController.getActiveIncentives));

module.exports = router;
