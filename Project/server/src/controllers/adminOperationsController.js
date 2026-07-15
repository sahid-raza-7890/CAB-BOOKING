const AdminOperationsService = require('../services/adminOperationsService');
const ResponseFormatter = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

class AdminOperationsController {
    static dashboard = asyncWrapper(async (req, res) => {
        const data = await AdminOperationsService.adminOperationsDashboard();
        return ResponseFormatter.successAdmin(res, data, 'Operations Dashboard retrieved');
    });

    static liveMap = asyncWrapper(async (req, res) => {
        const drivers = await AdminOperationsService.adminDriverLocations();
        const passengers = await AdminOperationsService.adminPassengerMap();
        const rides = await AdminOperationsService.adminRideMap();
        const surge = await AdminOperationsService.adminSurgeZones();
        return ResponseFormatter.successAdmin(res, { drivers, passengers, rides, surge }, 'Live Map data retrieved');
    });

    static activeRides = asyncWrapper(async (req, res) => {
        const data = await AdminOperationsService.adminActiveRides();
        return ResponseFormatter.successAdmin(res, data, 'Active Rides retrieved');
    });

    static onlineDrivers = asyncWrapper(async (req, res) => {
        const data = await AdminOperationsService.adminOnlineDrivers();
        return ResponseFormatter.successAdmin(res, data, 'Online Drivers retrieved');
    });

    static waitingPassengers = asyncWrapper(async (req, res) => {
        const data = await AdminOperationsService.adminWaitingPassengers();
        return ResponseFormatter.successAdmin(res, data, 'Waiting Passengers retrieved');
    });

    static dispatchQueue = asyncWrapper(async (req, res) => {
        const queue = await AdminOperationsService.adminDispatchQueue();
        const metrics = await AdminOperationsService.adminDispatchMetrics();
        return ResponseFormatter.successAdmin(res, { queue, metrics }, 'Dispatch Queue retrieved');
    });

    static surgeZones = asyncWrapper(async (req, res) => {
        const data = await AdminOperationsService.adminSurgeZones();
        return ResponseFormatter.successAdmin(res, data, 'Surge Zones retrieved');
    });

    static sosAlerts = asyncWrapper(async (req, res) => {
        const data = await AdminOperationsService.adminLiveSOS();
        return ResponseFormatter.successAdmin(res, data, 'Live SOS retrieved');
    });

    static supportQueue = asyncWrapper(async (req, res) => {
        const data = await AdminOperationsService.adminLiveSupportQueue();
        return ResponseFormatter.successAdmin(res, data, 'Support Queue retrieved');
    });

    static systemHealth = asyncWrapper(async (req, res) => {
        // Can import adminDashboardService for real health
        const AdminDashboardService = require('../services/adminDashboardService');
        const data = await AdminDashboardService.getSystemHealth();
        return ResponseFormatter.successAdmin(res, data, 'System Health retrieved');
    });

    static metrics = asyncWrapper(async (req, res) => {
        const data = await AdminOperationsService.adminMetrics();
        return ResponseFormatter.successAdmin(res, data, 'Operations Metrics retrieved');
    });
}

module.exports = AdminOperationsController;
