const express = require('express');
const router = express.Router();
const AdminAnalyticsController = require('../controllers/adminAnalyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireRole('Admin'));

// GET /api/admin/analytics/dashboard
router.get('/dashboard', AdminAnalyticsController.getDashboard);

// GET /api/admin/analytics/revenue
router.get('/revenue', AdminAnalyticsController.getRevenueAnalytics);

// GET /api/admin/analytics/rides
router.get('/rides', AdminAnalyticsController.getRideAnalytics);

// GET /api/admin/analytics/drivers
router.get('/drivers', AdminAnalyticsController.getDriverAnalytics);

// GET /api/admin/analytics/passengers
router.get('/passengers', AdminAnalyticsController.getPassengerAnalytics);

// GET /api/admin/analytics/finance
router.get('/finance', AdminAnalyticsController.getFinancialAnalytics);

// GET /api/admin/analytics/promotions
router.get('/promotions', AdminAnalyticsController.getPromotionAnalytics);

// GET /api/admin/analytics/safety
router.get('/safety', AdminAnalyticsController.getSafetyAnalytics);

// GET /api/admin/analytics/geography
router.get('/geography', AdminAnalyticsController.getGeographicalAnalytics);

// GET /api/admin/analytics/kpis
router.get('/kpis', AdminAnalyticsController.getPlatformKPIs);

// POST /api/admin/analytics/export (Changed from GET to POST since it accepts a body)
router.post('/export', AdminAnalyticsController.exportAnalytics);

module.exports = router;
