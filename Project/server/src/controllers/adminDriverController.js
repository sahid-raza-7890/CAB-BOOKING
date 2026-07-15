const DriverService = require('../services/driverService');
const ResponseFormatter = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

class AdminDriverController {

    // GET /api/admin/drivers
    static listDrivers = asyncWrapper(async (req, res) => {
        const {
            page = 1,
            limit = 20,
            status,
            search,
            sort = 'newest'
        } = req.query;

        const result = await DriverService.getFilteredDrivers({
            page: parseInt(page, 10),
            limit: Math.min(parseInt(limit, 10) || 20, 100),
            status,
            search,
            sort
        });

        return ResponseFormatter.successAdmin(res, result, 'Drivers retrieved successfully');
    });

    // GET /api/admin/drivers/:id
    static getDriver = asyncWrapper(async (req, res) => {
        const driver = await DriverService.adminGetDriverDetails(req.params.id);
        return ResponseFormatter.successAdmin(res, driver, 'Driver details retrieved successfully');
    });

    // PUT /api/admin/drivers/:id/status
    static updateStatus = asyncWrapper(async (req, res) => {
        const { status } = req.body;
        if (!status) {
            return ResponseFormatter.error(res, 'Status is required', 'VALIDATION_ERROR', {}, 400);
        }
        const io = req.app.get('io');
        const driver = await DriverService.adminUpdateDriverStatus(req.params.id, status, req.user._id, req.ip, io);
        return ResponseFormatter.successAdmin(res, driver, `Driver status updated to ${status}`);
    });

    // PUT /api/admin/drivers/:id/verify
    static verifyDriver = asyncWrapper(async (req, res) => {
        const io = req.app.get('io');
        const driver = await DriverService.adminVerifyDriver(req.params.id, req.user._id, req.ip, io);
        return ResponseFormatter.successAdmin(res, driver, 'Driver verified successfully');
    });

    // PUT /api/admin/drivers/:id/suspend
    static suspendDriver = asyncWrapper(async (req, res) => {
        const io = req.app.get('io');
        const driver = await DriverService.adminSuspendDriver(req.params.id, req.user._id, req.ip, io);
        return ResponseFormatter.successAdmin(res, driver, 'Driver suspended successfully');
    });

    // PUT /api/admin/drivers/:id/reactivate
    static reactivateDriver = asyncWrapper(async (req, res) => {
        const io = req.app.get('io');
        const driver = await DriverService.adminReactivateDriver(req.params.id, req.user._id, req.ip, io);
        return ResponseFormatter.successAdmin(res, driver, 'Driver reactivated successfully');
    });

    // GET /api/admin/drivers/:id/documents
    static getDocuments = asyncWrapper(async (req, res) => {
        const documents = await DriverService.getDriverDocuments(req.params.id);
        return ResponseFormatter.successAdmin(res, documents, 'Driver documents retrieved successfully');
    });

    // GET /api/admin/drivers/:id/vehicles
    static getVehicles = asyncWrapper(async (req, res) => {
        const vehicles = await DriverService.getDriverVehicles(req.params.id);
        return ResponseFormatter.successAdmin(res, vehicles, 'Driver vehicles retrieved successfully');
    });

    // GET /api/admin/drivers/:id/earnings
    static getEarnings = asyncWrapper(async (req, res) => {
        const earnings = await DriverService.getDriverEarnings(req.params.id);
        return ResponseFormatter.successAdmin(res, earnings, 'Driver earnings history retrieved successfully');
    });

    // GET /api/admin/drivers/:id/history
    static getHistory = asyncWrapper(async (req, res) => {
        const history = await DriverService.getDriverHistory(req.params.id);
        return ResponseFormatter.successAdmin(res, history, 'Driver ride history retrieved successfully');
    });
}

module.exports = AdminDriverController;
