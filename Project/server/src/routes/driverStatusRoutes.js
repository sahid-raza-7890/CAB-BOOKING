const express = require('express');
const router = express.Router();
const DriverStatusController = require('../controllers/driverStatusController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');

// Driver specific routes, must be authenticated and have role Driver
router.use(authMiddleware);
router.use(requireRole('Driver'));

// â”€â”€â”€ PUT /api/driver/status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.put('/', asyncWrapper(DriverStatusController.updateStatus));

// â”€â”€â”€ POST /api/driver/heartbeat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/heartbeat', asyncWrapper(DriverStatusController.heartbeat));

module.exports = router;
