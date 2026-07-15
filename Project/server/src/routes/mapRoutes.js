const express = require('express');
const router = express.Router();
const MapController = require('../controllers/mapController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');

// Public Autocomplete (no auth needed)
router.get('/autocomplete', asyncWrapper(MapController.autocomplete));
// Public Provider Info
router.get('/provider', asyncWrapper(MapController.provider));

// Secured Endpoints (requires auth)
router.post('/reverse-geocode', authMiddleware, asyncWrapper(MapController.reverseGeocode));
router.post('/validate-pickup', authMiddleware, asyncWrapper(MapController.validatePickup));

// Migrated from server.js and secured
router.post('/calculate-distance', authMiddleware, asyncWrapper(MapController.calculateDistance));

module.exports = router;
