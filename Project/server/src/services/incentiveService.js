const DriverIncentive = require('../models/DriverIncentive');
const DriverBonusHistory = require('../models/DriverBonusHistory');
const WalletService = require('./walletService');

class IncentiveService {
    
    static async getActiveIncentives(now = new Date()) {
        return await DriverIncentive.find({
            active: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });
    }

    static async getBonusHistory(driverId) {
        return await DriverBonusHistory.find({ driverId });
    }

    /**
     * Checks if a driver's completed ride qualifies for any active quest.
     */
    static async incrementProgress(driverId, rideType, fare) {
        const now = new Date();
        const activeIncentives = await DriverIncentive.find({
            active: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });

        if (!activeIncentives.length) return;

        const Ride = require('../models/Ride');

        for (const incentive of activeIncentives) {
            // Check if driver has already completed and claimed this exact quest
            const existingHistory = await DriverBonusHistory.findOne({ driverId, incentiveId: incentive._id });
            if (existingHistory) continue;

            // Query the DB for the number of rides completed by the driver within the incentive window
            const query = {
                driver: driverId,
                status: 'Completed',
                'timeline.rideCompleted': { $gte: incentive.startDate, $lte: incentive.endDate }
            };

            // If incentive is restricted by vehicle type, match the rideType
            if (incentive.vehicleTypes && incentive.vehicleTypes.length > 0) {
                // If rideType is passed in we can skip if it doesn't match
                if (rideType && !incentive.vehicleTypes.includes(rideType)) {
                    continue;
                }
            }

            const validRides = await Ride.countDocuments(query);

            if (validRides >= incentive.targetTrips) {
                // 1. Record History
                const history = new DriverBonusHistory({
                    driverId,
                    incentiveId: incentive._id,
                    reward: incentive.reward,
                    rewardType: 'Cash'
                });

                // 2. Credit Wallet immediately
                try {
                    const { transaction } = await WalletService.credit(
                        driverId.toString(),
                        'Driver',
                        incentive.reward,
                        incentive._id.toString(),
                        'Bonus',
                        'System',
                        { notes: `Quest Completed: ${incentive.title}` }
                    );
                    history.walletTransactionId = transaction._id;
                    history.claimed = true;
                    history.claimedAt = new Date();
                } catch (err) {
                    console.error('Failed to credit bonus:', err);
                }

                await history.save();
            }
        }
    }

    // â”€â”€â”€ ADMIN CAMPAIGNS & INCENTIVES (Sprint 27) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async adminGetDriverIncentives() {
        return await DriverIncentive.find().sort({ createdAt: -1 }).lean();
    }

    static async adminCreateDriverIncentive(data, adminId, ipAddress) {
        const incentive = new DriverIncentive({
            title: data.title,
            description: data.description,
            targetTrips: data.targetTrips,
            targetAmount: data.targetAmount || 0,
            reward: data.reward,
            vehicleTypes: data.vehicleTypes || ['Basic', 'SUV', 'Luxury'],
            cityRestrictions: data.cityRestrictions || [],
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            activeDays: data.activeDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            active: data.active !== undefined ? data.active : true
        });
        await incentive.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'CREATE_INCENTIVE',
            targetType: 'DriverIncentive',
            targetId: incentive._id,
            details: { title: incentive.title, reward: incentive.reward },
            ipAddress
        });

        return incentive;
    }

    static async adminUpdateDriverIncentive(id, data, adminId, ipAddress) {
        const incentive = await DriverIncentive.findById(id);
        if (!incentive) throw new Error('Driver incentive not found');

        const prevData = { title: incentive.title, reward: incentive.reward, active: incentive.active };

        if (data.title !== undefined) incentive.title = data.title;
        if (data.description !== undefined) incentive.description = data.description;
        if (data.targetTrips !== undefined) incentive.targetTrips = data.targetTrips;
        if (data.targetAmount !== undefined) incentive.targetAmount = data.targetAmount;
        if (data.reward !== undefined) incentive.reward = data.reward;
        if (data.vehicleTypes !== undefined) incentive.vehicleTypes = data.vehicleTypes;
        if (data.cityRestrictions !== undefined) incentive.cityRestrictions = data.cityRestrictions;
        if (data.startDate !== undefined) incentive.startDate = new Date(data.startDate);
        if (data.endDate !== undefined) incentive.endDate = new Date(data.endDate);
        if (data.activeDays !== undefined) incentive.activeDays = data.activeDays;
        if (data.active !== undefined) incentive.active = data.active;

        await incentive.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'UPDATE_INCENTIVE',
            targetType: 'DriverIncentive',
            targetId: incentive._id,
            details: { previous: prevData, updated: { title: incentive.title, reward: incentive.reward, active: incentive.active } },
            ipAddress
        });

        return incentive;
    }

    static async adminEnableDriverIncentive(id, adminId, ipAddress) {
        const incentive = await DriverIncentive.findById(id);
        if (!incentive) throw new Error('Driver incentive not found');

        incentive.active = true;
        await incentive.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'ENABLE_INCENTIVE',
            targetType: 'DriverIncentive',
            targetId: incentive._id,
            details: { title: incentive.title },
            ipAddress
        });

        return incentive;
    }

    static async adminDisableDriverIncentive(id, adminId, ipAddress) {
        const incentive = await DriverIncentive.findById(id);
        if (!incentive) throw new Error('Driver incentive not found');

        incentive.active = false;
        await incentive.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'DISABLE_INCENTIVE',
            targetType: 'DriverIncentive',
            targetId: incentive._id,
            details: { title: incentive.title },
            ipAddress
        });

        return incentive;
    }

    static async adminGetCampaignAnalytics() {
        const Campaign = require('../models/Campaign');
        const Coupon = require('../models/Coupon');
        const OfferRedemption = require('../models/OfferRedemption');

        const [campaignCount, couponCount, totalRedemptions, bonusEarned] = await Promise.all([
            Campaign.countDocuments(),
            Coupon.countDocuments(),
            OfferRedemption.countDocuments(),
            DriverBonusHistory.aggregate([
                { $group: { _id: null, total: { $sum: '$reward' } } }
            ])
        ]);

        const bonus = bonusEarned[0] || { total: 0 };

        return {
            campaignCount,
            couponCount,
            totalRedemptions,
            totalBonusPaid: bonus.total
        };
    }
}

module.exports = IncentiveService;
