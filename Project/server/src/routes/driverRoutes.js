const express = require('express');
const router = express.Router();
const DriverController = require('../controllers/driverController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Get all drivers (Secured for Admin)
router.get('/', authMiddleware, requireRole('Admin'), asyncWrapper(DriverController.getDrivers));

// Profile management (Driver)
router.get('/profile', authMiddleware, requireRole('Driver'), asyncWrapper(DriverController.getProfile));
router.put('/profile', authMiddleware, requireRole('Driver'), asyncWrapper(DriverController.updateProfile));
router.put('/banking', authMiddleware, requireRole('Driver'), asyncWrapper(DriverController.updateBanking));
router.post('/profile/avatar', authMiddleware, requireRole('Driver'), asyncWrapper(DriverController.changeAvatar));
router.delete('/profile/avatar', authMiddleware, requireRole('Driver'), asyncWrapper(DriverController.deleteAvatar));
router.put('/schedule', authMiddleware, requireRole('Driver'), asyncWrapper(DriverController.updateSchedule));
router.put('/documents', authMiddleware, requireRole('Driver'), asyncWrapper(DriverController.updateDocuments));

module.exports = router;
