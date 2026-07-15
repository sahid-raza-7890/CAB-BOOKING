const express = require('express');
const router = express.Router();
const VehicleController = require('../controllers/vehicleController');
const asyncWrapper = require('../utils/asyncWrapper');

// GET /api/vehicles â€” all active vehicles (public, no auth required)
router.get('/', asyncWrapper(VehicleController.getAllVehicles));

// GET /api/vehicles/:id â€” single vehicle detail (public)
router.get('/:id', asyncWrapper(VehicleController.getVehicle));

module.exports = router;
