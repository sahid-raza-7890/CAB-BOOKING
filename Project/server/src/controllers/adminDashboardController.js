const AdminDashboardService = require('../services/adminDashboardService');
const ResponseFormatter = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

class AdminDashboardController {
    static getDashboardData = asyncWrapper(async (req, res) => {
        const dashboard = await AdminDashboardService.getDashboard();
        return ResponseFormatter.successAdmin(res, dashboard, 'Dashboard data retrieved successfully');
    });
}

module.exports = AdminDashboardController;
