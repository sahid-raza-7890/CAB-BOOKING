const DriverEarning = require('../models/DriverEarning');
const EarningCalculator = require('./earningCalculator');
const WalletService = require('./walletService');
const IncentiveService = require('./incentiveService'); // We will build this next
const DriverSettlementService = require('./driverSettlementService');

class DriverEarningService {
    /**
     * Processes earnings for a newly completed ride.
     * This is the entry point from the Ride completion lifecycle.
     */
    static async processRideEarning(driverId, rideId, grossFare, tip = 0, rideType = 'City', paymentMethod = 'Wallet') {
        
        // 1. Calculate Breakdown
        const breakdown = EarningCalculator.calculateRide(grossFare, tip, 0, 0, rideType, 'CompletedRide');
        
        // 2. Create Earning Record
        const earning = new DriverEarning({
            driverId,
            rideId,
            rideType,
            earningSource: 'CompletedRide',
            paymentMethod,
            ...breakdown
        });

        // 3. Credit Driver Wallet (Uses existing Wallet Module with userType = 'Driver')
        // We only credit the NET earning.
        try {
            const { transaction } = await WalletService.credit(
                driverId.toString(),
                'Driver',
                breakdown.netEarning,
                rideId.toString(),
                'RideEarning',
                'System',
                { notes: `Earnings for Ride ${rideId}` }
            );

            earning.walletTransactionId = transaction._id;
            earning.paymentStatus = 'Credited';
        } catch (error) {
            console.error('[DriverEarning] Failed to credit wallet:', error);
            earning.paymentStatus = 'Pending';
        }

        await earning.save();

        // 4. Update the active settlement period
        await DriverSettlementService.logEarningToActiveSettlement(driverId, earning);

        // 5. Update active Quests/Incentives
        // Using setTimeout to prevent blocking the main ride completion flow for analytics
        setTimeout(async () => {
            try {
                await IncentiveService.incrementProgress(driverId, rideType, grossFare);
            } catch (err) {
                console.error('[DriverEarning] Incentive calculation error:', err);
            }
        }, 0);

        return earning;
    }

    static async getEarnings(query) {
        return await DriverEarning.find(query).sort({ completedAt: -1 }).lean();
    }

    static async getEarningsByDriver(driverId) {
        return await DriverEarning.find({ driverId });
    }

    static async getEarningsHistory(driverId) {
        return await DriverEarning.find({ driverId }).sort({ completedAt: -1 }).populate('rideId', 'pickup dropoff');
    }

    static async getDailySummary(driverId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const agg = await DriverEarning.aggregate([
            { $match: { driverId: driverId, completedAt: { $gte: today } } },
            { $group: {
                _id: null,
                totalGross: { $sum: '$grossFare' },
                totalNet: { $sum: '$netEarning' },
                totalTrips: { $sum: 1 },
                totalTips: { $sum: '$tip' }
            }}
        ]);

        return agg.length > 0 ? agg[0] : { totalGross: 0, totalNet: 0, totalTrips: 0, totalTips: 0 };
    }

    // --- Admin Dashboard Aggregations ---
    static async getAdminTopDrivers() {
        const User = require('../models/User'); // For populating name
        
        const agg = await DriverEarning.aggregate([
            { $group: { _id: '$driverId', totalEarnings: { $sum: '$netEarning' }, totalTrips: { $sum: 1 } } },
            { $sort: { totalEarnings: -1 } },
            { $limit: 4 }
        ]);

        const populated = [];
        for (const drv of agg) {
            const user = await User.findById(drv._id).select('name');
            // Mock rating for now, or fetch from Driver profile if available
            populated.push({
                name: user ? user.name : 'Unknown Driver',
                trips: drv.totalTrips,
                earning: drv.totalEarnings,
                rating: 4.8
            });
        }
        return populated;
    }

    // â”€â”€â”€ ADMIN FINANCIAL OPERATIONS (Sprint 26) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async getDriverEarningsReport() {
        const DriverEarning = require('../models/DriverEarning');
        return await DriverEarning.aggregate([
            {
                $group: {
                    _id: '$driverId',
                    totalGross: { $sum: '$grossFare' },
                    totalNet: { $sum: '$netEarning' },
                    totalCommission: { $sum: '$commission' },
                    totalTips: { $sum: '$tip' },
                    totalTrips: { $sum: 1 }
                }
            },
            { $sort: { totalNet: -1 } }
        ]);
    }
}

module.exports = DriverEarningService;
