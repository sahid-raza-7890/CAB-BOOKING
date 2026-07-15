const RideService = require('../services/rideService');
const DriverService = require('../services/driverService');
const UserService = require('../services/userService');
const WalletService = require('../services/walletService');
const PaymentService = require('../services/paymentService');
const PromotionService = require('../services/promotionService');
const SafetyService = require('../services/safetyService');
const SupportService = require('../services/supportService');
const AdminAuditService = require('../services/adminAuditService');
const ResponseFormatter = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

class AdminAnalyticsController {
    
    // GET /api/admin/analytics/dashboard
    static getDashboard = asyncWrapper(async (req, res) => {
        const kpis = await RideService.getAdminDashboardKPIs();
        return ResponseFormatter.successAdmin(res, kpis, 'Analytics dashboard retrieved');
    });

    // GET /api/admin/analytics/revenue
    static getRevenueAnalytics = asyncWrapper(async (req, res) => {
        const revenue = await PaymentService.adminRevenueAnalytics();
        return ResponseFormatter.successAdmin(res, revenue, 'Revenue analytics retrieved');
    });

    // GET /api/admin/analytics/rides
    static getRideAnalytics = asyncWrapper(async (req, res) => {
        const rideStats = await RideService.adminRideAnalytics();
        return ResponseFormatter.successAdmin(res, rideStats, 'Ride analytics retrieved');
    });

    // GET /api/admin/analytics/drivers
    static getDriverAnalytics = asyncWrapper(async (req, res) => {
        const driverStats = await DriverService.adminDriverAnalytics();
        const leaderboard = await DriverService.adminPerformanceLeaderboard();
        return ResponseFormatter.successAdmin(res, { ...driverStats, leaderboard }, 'Driver analytics retrieved');
    });

    // GET /api/admin/analytics/passengers
    static getPassengerAnalytics = asyncWrapper(async (req, res) => {
        const passengerStats = await UserService.adminPassengerAnalytics();
        const retention = await UserService.adminRetentionAnalytics();
        return ResponseFormatter.successAdmin(res, { ...passengerStats, ...retention }, 'Passenger analytics retrieved');
    });

    // GET /api/admin/analytics/finance
    static getFinancialAnalytics = asyncWrapper(async (req, res) => {
        const paymentStats = await PaymentService.adminPaymentAnalytics();
        const walletStats = await WalletService.adminWalletAnalytics();
        return ResponseFormatter.successAdmin(res, { ...paymentStats, ...walletStats }, 'Financial analytics retrieved');
    });

    // GET /api/admin/analytics/promotions
    static getPromotionAnalytics = asyncWrapper(async (req, res) => {
        const promoStats = await PromotionService.adminPromotionAnalytics();
        return ResponseFormatter.successAdmin(res, promoStats, 'Promotion analytics retrieved');
    });

    // GET /api/admin/analytics/safety
    static getSafetyAnalytics = asyncWrapper(async (req, res) => {
        const safetyStats = await SafetyService.adminSafetyAnalytics();
        const supportStats = await SupportService.adminSupportAnalytics();
        return ResponseFormatter.successAdmin(res, { ...safetyStats, ...supportStats }, 'Safety analytics retrieved');
    });

    // GET /api/admin/analytics/geography
    static getGeographicalAnalytics = asyncWrapper(async (req, res) => {
        const topCities = await RideService.getAdminTopCities();
        const heatmap = await RideService.adminHeatmap();
        return ResponseFormatter.successAdmin(res, { topCities, heatmap }, 'Geographical analytics retrieved');
    });

    // GET /api/admin/analytics/kpis
    static getPlatformKPIs = asyncWrapper(async (req, res) => {
        const kpis = await RideService.getAdminDashboardKPIs();
        const demand = await RideService.adminDemandAnalytics();
        return ResponseFormatter.successAdmin(res, { ...kpis, ...demand }, 'Platform KPIs retrieved');
    });

    // POST /api/admin/analytics/export
    static exportAnalytics = asyncWrapper(async (req, res) => {
        const adminId = req.user.id;
        const ipAddress = req.ip;
        const { filters, reportType } = req.body;

        await AdminAuditService.logAction({
            adminId,
            action: 'EXPORT_ANALYTICS',
            targetType: 'Analytics',
            targetId: adminId, // pseudo id
            details: { filters, reportType },
            ipAddress
        });

        // Mock export url
        return ResponseFormatter.successAdmin(res, {
            url: `https://ucab.com/exports/analytics-${Date.now()}.csv`
        }, 'Analytics exported successfully');
    });
}

module.exports = AdminAnalyticsController;
