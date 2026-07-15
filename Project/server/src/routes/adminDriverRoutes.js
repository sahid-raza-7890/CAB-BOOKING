const express = require('express');
const router = express.Router();
const AdminDriverController = require('../controllers/adminDriverController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Enforce authentication and Admin roles on all endpoints
router.use(authMiddleware, requireRole('Admin'));

// listing & details
router.get('/', AdminDriverController.listDrivers);
router.get('/:id', AdminDriverController.getDriver);

// status updates
router.put('/:id/status', AdminDriverController.updateStatus);
router.put('/:id/verify', AdminDriverController.verifyDriver);
router.put('/:id/suspend', AdminDriverController.suspendDriver);
router.put('/:id/reactivate', AdminDriverController.reactivateDriver);

// relations
router.get('/:id/documents', AdminDriverController.getDocuments);
router.get('/:id/vehicles', AdminDriverController.getVehicles);
router.get('/:id/earnings', AdminDriverController.getEarnings);
router.get('/:id/history', AdminDriverController.getHistory);

module.exports = router;
