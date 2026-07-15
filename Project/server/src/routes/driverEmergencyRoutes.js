const express = require('express');
const router = express.Router();
const DriverEmergencyController = require('../controllers/driverEmergencyController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');

router.use(authMiddleware);
router.use(requireRole('Driver'));

router.post('/sos', asyncWrapper(DriverEmergencyController.triggerSOS));
router.post('/cancel', asyncWrapper(DriverEmergencyController.cancelSOS));
router.post('/location', asyncWrapper(DriverEmergencyController.shareLiveLocation));
router.post('/breakdown', asyncWrapper(DriverEmergencyController.reportBreakdown));
router.post('/incident', asyncWrapper(DriverEmergencyController.reportIncident));
router.post('/unsafe-passenger', asyncWrapper(DriverEmergencyController.reportUnsafePassenger));
router.get('/timeline', asyncWrapper(DriverEmergencyController.getSafetyTimeline));

module.exports = router;
