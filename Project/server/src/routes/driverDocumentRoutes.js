const express = require('express');
const router = express.Router();
const DriverDocumentController = require('../controllers/driverDocumentController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');

router.use(authMiddleware);
router.use(requireRole('Driver'));

router.get('/', asyncWrapper(DriverDocumentController.getDocuments));
router.post('/', asyncWrapper(DriverDocumentController.uploadDocument));
router.get('/compliance', asyncWrapper(DriverDocumentController.getComplianceStatus));
router.get('/:id', asyncWrapper(DriverDocumentController.getDocument));
router.put('/:id/renew', asyncWrapper(DriverDocumentController.renewDocument));
router.delete('/:id', asyncWrapper(DriverDocumentController.deleteDocument));

module.exports = router;
