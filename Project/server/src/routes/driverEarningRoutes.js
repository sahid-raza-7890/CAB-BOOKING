const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');
const DriverEarningController = require('../controllers/driverEarningController');
const requireRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireRole('Driver'));

// â”€â”€â”€ GET /api/driver/earnings/summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/summary', asyncWrapper(DriverEarningController.getSummary));

// â”€â”€â”€ GET /api/driver/earnings/history â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/history', asyncWrapper(DriverEarningController.getHistory));

module.exports = router;
