const express = require('express');
const router = express.Router();
const DriverVehicleController = require('../controllers/driverVehicleController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');

router.use(authMiddleware);
router.use(requireRole('Driver'));

router.get('/', asyncWrapper(DriverVehicleController.getVehicles));
router.post('/', asyncWrapper(DriverVehicleController.addVehicle));
router.put('/:id', asyncWrapper(DriverVehicleController.updateVehicle));
router.delete('/:id', asyncWrapper(DriverVehicleController.deleteVehicle));
router.put('/:id/activate', asyncWrapper(DriverVehicleController.setActiveVehicle));

module.exports = router;
