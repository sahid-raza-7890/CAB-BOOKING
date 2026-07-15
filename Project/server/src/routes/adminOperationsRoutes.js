const express = require('express');
const AdminOperationsController = require('../controllers/adminOperationsController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

// Protect all operations routes
router.use(authMiddleware, requireRole('Admin'));

router.get('/dashboard', AdminOperationsController.dashboard);
router.get('/map', AdminOperationsController.liveMap);
router.get('/rides', AdminOperationsController.activeRides);
router.get('/drivers', AdminOperationsController.onlineDrivers);
router.get('/passengers', AdminOperationsController.waitingPassengers);
router.get('/dispatch', AdminOperationsController.dispatchQueue);
router.get('/surge', AdminOperationsController.surgeZones);
router.get('/sos', AdminOperationsController.sosAlerts);
router.get('/support', AdminOperationsController.supportQueue);
router.get('/system', AdminOperationsController.systemHealth);
router.get('/metrics', AdminOperationsController.metrics);

module.exports = router;
