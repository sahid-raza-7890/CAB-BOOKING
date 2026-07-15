const DriverDashboardService = require('../services/driverDashboardService');

class DriverDashboardController {
    static async getDashboard(req, res) {
        const dashboard = await DriverDashboardService.getDashboard(req.user.id);
        res.json({ success: true, data: dashboard });
    }

    static async getTodaySummary(req, res) {
        const data = await DriverDashboardService.getTodaySummary(req.user.id);
        res.json({ success: true, data });
    }

    static async getWeeklySummary(req, res) {
        const data = await DriverDashboardService.getWeeklySummary(req.user.id);
        res.json({ success: true, data });
    }

    static async getMonthlySummary(req, res) {
        const data = await DriverDashboardService.getMonthlySummary(req.user.id);
        res.json({ success: true, data });
    }

    static async getWalletSummary(req, res) {
        const data = await DriverDashboardService.getWalletSummary(req.user.id);
        res.json({ success: true, data });
    }

    static async getSettlements(req, res) {
        const data = await DriverDashboardService.getSettlementSummary(req.user.id);
        res.json({ success: true, data });
    }

    static async getIncentives(req, res) {
        const data = await DriverDashboardService.getIncentiveSummary(req.user.id);
        res.json({ success: true, data });
    }

    static async getTransactions(req, res) {
        const data = await DriverDashboardService.getRecentTransactions(req.user.id);
        res.json({ success: true, data });
    }
}

module.exports = DriverDashboardController;
