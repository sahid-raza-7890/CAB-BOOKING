const DriverEarningService = require('./driverEarningService');
const DriverSettlementService = require('./driverSettlementService');
const WalletService = require('./walletService');
const IncentiveService = require('./incentiveService');
const WalletTransaction = require('../models/WalletTransaction');

class DriverDashboardService {
    
    /**
     * Helper to get start and end dates for a given period
     */
    static _getDateRange(period) {
        const now = new Date();
        const start = new Date(now);
        const end = new Date(now);
        
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        if (period === 'week') {
            const day = start.getDay() || 7; // Monday = 1
            start.setDate(start.getDate() - day + 1);
            end.setDate(start.getDate() + 6);
        } else if (period === 'month') {
            start.setDate(1);
            end.setMonth(end.getMonth() + 1);
            end.setDate(0);
        }
        
        return { start, end };
    }

    /**
     * Helper to aggregate earnings for a specific date range
     */
    static async _getEarningSummary(driverId, period) {
        const { start, end } = this._getDateRange(period);
        const earnings = await DriverEarningService.getEarnings({
            driverId,
            completedAt: { $gte: start, $lte: end }
        });

        const summary = { total: 0, trips: 0, timeOnline: 0 }; // timeOnline is mocked/defaulted for now
        
        for (const earn of earnings) {
            summary.total += earn.netEarning;
            summary.trips += 1;
            summary.timeOnline += 0.5; // ~30 min per trip estimation
        }
        
        return summary;
    }

    static async getTodaySummary(driverId) {
        return await this._getEarningSummary(driverId, 'today');
    }

    static async getWeeklySummary(driverId) {
        return await this._getEarningSummary(driverId, 'week');
    }

    static async getMonthlySummary(driverId) {
        return await this._getEarningSummary(driverId, 'month');
    }

    static async getWalletSummary(driverId) {
        return await WalletService.getOrCreateWallet(driverId, 'Driver');
    }

    static async getSettlementSummary(driverId) {
        return await DriverSettlementService.getSettlements(driverId);
    }

    static async getIncentiveSummary(driverId) {
        // Gets all active incentives + driver's specific bonus history
        const activeIncentives = await IncentiveService.getActiveIncentives();
        const history = await IncentiveService.getBonusHistory(driverId);
        return { activeIncentives, history };
    }

    static async getRecentTransactions(driverId) {
        const wallet = await WalletService.getOrCreateWallet(driverId, 'Driver');
        return await WalletTransaction.find({ walletId: wallet._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
    }

    /**
     * Aggregates all dashboard data in parallel.
     */
    static async getDashboard(driverId) {
        const Driver = require('../models/Driver');
        const Ride = require('../models/Ride');

        const [
            today,
            week,
            month,
            wallet,
            settlements,
            incentives,
            transactions,
            driverData,
            vehicles,
            totalAssignedRides,
            completedRides,
            cancelledRides
        ] = await Promise.all([
            this.getTodaySummary(driverId),
            this.getWeeklySummary(driverId),
            this.getMonthlySummary(driverId),
            this.getWalletSummary(driverId),
            this.getSettlementSummary(driverId),
            this.getIncentiveSummary(driverId),
            this.getRecentTransactions(driverId),
            Driver.findById(driverId).select('rating ratingCount badges phone status').lean(),
            require('../models/DriverVehicle').find({ driverId }).lean(),
            Ride.countDocuments({ driver: driverId }),
            Ride.countDocuments({ driver: driverId, status: 'Completed' }),
            Ride.countDocuments({ driver: driverId, status: 'Cancelled' })
        ]);

        const acceptanceRate = totalAssignedRides > 0 
            ? Math.round((completedRides / totalAssignedRides) * 100) 
            : 100;
            
        const cancellationRate = totalAssignedRides > 0 
            ? Math.round((cancelledRides / totalAssignedRides) * 100) 
            : 0;

        return {
            today,
            week,
            month,
            wallet,
            settlements,
            incentives,
            transactions,
            analytics: {
                averageRating: driverData?.rating || 0,
                ratingCount: driverData?.ratingCount || 0,
                badges: driverData?.badges || [],
                acceptanceRate,
                cancellationRate,
                completedRides
            },
            driverProfile: {
                phone: driverData?.phone || '',
                status: driverData?.status || 'Pending'
            },
            vehicles: vehicles || []
        };
    }
}

module.exports = DriverDashboardService;
