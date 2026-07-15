const express = require('express');
const router = express.Router();
const DriverDashboardController = require('../controllers/driverDashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');

router.use(authMiddleware);
router.use(requireRole('Driver'));

router.get('/', asyncWrapper(DriverDashboardController.getDashboard));
router.get('/today', asyncWrapper(DriverDashboardController.getTodaySummary));
router.get('/week', asyncWrapper(DriverDashboardController.getWeeklySummary));
router.get('/month', asyncWrapper(DriverDashboardController.getMonthlySummary));
router.get('/wallet', asyncWrapper(DriverDashboardController.getWalletSummary));
router.get('/settlements', asyncWrapper(DriverDashboardController.getSettlements));
router.get('/incentives', asyncWrapper(DriverDashboardController.getIncentives));
router.get('/transactions', asyncWrapper(DriverDashboardController.getTransactions));

module.exports = router;
