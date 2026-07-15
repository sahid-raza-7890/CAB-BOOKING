const express = require('express');
const router = express.Router();
const SafetyController = require('../controllers/safetyController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireRole('Passenger'));

router.get('/', asyncWrapper(SafetyController.getAlerts));
router.get('/timeline', asyncWrapper(SafetyController.getSafetyTimeline));
router.get('/emergency-contacts', asyncWrapper(SafetyController.getEmergencyContacts));
router.put('/emergency-contacts', asyncWrapper(SafetyController.updateEmergencyContacts));
router.get('/:id', asyncWrapper(SafetyController.getAlert));
router.post('/alert', asyncWrapper(SafetyController.createAlert));
router.post('/incident', asyncWrapper(SafetyController.reportIncident));
router.put('/:id/cancel', asyncWrapper(SafetyController.cancelAlert));
router.put('/:id/resolve', asyncWrapper(SafetyController.resolveAlert));
router.post('/share', asyncWrapper(SafetyController.shareLiveRide));

module.exports = router;
