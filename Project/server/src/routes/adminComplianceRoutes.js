const express = require('express');
const router = express.Router();
const AdminComplianceController = require('../controllers/adminComplianceController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Enforce auth & role checking
router.use(authMiddleware, requireRole('Admin'));

// Document endpoints
router.get('/documents', AdminComplianceController.listPendingDocuments);
router.post('/documents/check-expiry', AdminComplianceController.triggerExpiryCheck);
router.get('/documents/:driverId', AdminComplianceController.getDriverDocuments);
router.put('/documents/:id/approve', AdminComplianceController.approveDocument);
router.put('/documents/:id/reject', AdminComplianceController.rejectDocument);

// Vehicle endpoints
router.get('/vehicles', AdminComplianceController.listPendingVehicles);
router.get('/vehicles/:driverId', AdminComplianceController.getDriverVehicles);
router.put('/vehicles/:id/approve', AdminComplianceController.approveVehicle);
router.put('/vehicles/:id/reject', AdminComplianceController.rejectVehicle);

module.exports = router;
