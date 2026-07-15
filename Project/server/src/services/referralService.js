const ReferralCode = require('../models/ReferralCode');
const ReferralHistory = require('../models/ReferralHistory');
const WalletService = require('./walletService');
const NotificationService = require('./notificationService');
const crypto = require('crypto');

class ReferralService {

    /**
     * Generate or fetch a unique referral code for a passenger
     */
    static async generateReferralCode(userId) {
        let referral = await ReferralCode.findOne({ userId });
        if (referral) return referral;

        // Generate a 6-character alphanumeric code
        const rawCode = crypto.randomBytes(4).toString('hex').toUpperCase().substring(0, 6);
        const code = `UCAB-${rawCode}`;

        referral = new ReferralCode({
            userId,
            code,
            rewardAmount: 15.0, // Base reward
            maxUses: 50
        });

        await referral.save();
        return referral;
    }

    /**
     * Validate if a referral code is usable
     */
    static async validateReferral(code) {
        const referral = await ReferralCode.findOne({ code });
        if (!referral) throw new Error("Invalid referral code.");
        if (referral.status !== 'Active') throw new Error(`Referral code is ${referral.status}.`);
        if (referral.expiresAt && new Date(referral.expiresAt) < new Date()) throw new Error("Referral code has expired.");
        if (referral.totalUses >= referral.maxUses) throw new Error("Referral code has reached its usage limit.");
        
        return referral;
    }

    /**
     * Apply a referral code to a newly registered passenger
     */
    static async applyReferral(userId, code, io) {
        const referral = await this.validateReferral(code);

        // Prevent self-referral
        if (referral.userId.toString() === userId.toString()) {
            throw new Error("You cannot use your own referral code.");
        }

        // Prevent duplicate referrals (passenger can only be referred once)
        const existingHistory = await ReferralHistory.findOne({ referredUserId: userId });
        if (existingHistory) {
            throw new Error("You have already applied a referral code.");
        }

        // Create the pending referral history
        const history = new ReferralHistory({
            referrerId: referral.userId,
            referredUserId: userId,
            referralCode: referral.code,
            reward: referral.rewardAmount,
            status: 'Pending',
            rideRequirement: 1
        });

        await history.save();

        // Increment code uses
        referral.totalUses += 1;
        await referral.save();

        if (io) {
            io.emit(`referralUpdated_${referral.userId}`);
            io.emit(`referralUpdated_${userId}`);
        }

        return history;
    }

    /**
     * Qualify referral when the referred user completes a ride.
     * Called by RideService.completeRide()
     */
    static async qualifyReferral(userId, io) {
        // Find any pending referral where this user is the referred passenger
        const pendingReferrals = await ReferralHistory.find({ 
            referredUserId: userId, 
            status: 'Pending' 
        });

        for (const history of pendingReferrals) {
            history.completedRideCount += 1;
            
            // Check if they met the requirement
            if (history.completedRideCount >= history.rideRequirement) {
                history.status = 'Qualified';
                await history.save();

                // Automatically trigger the reward process
                await this.rewardReferral(history._id, io);
            } else {
                await history.save();
            }
        }
    }

    /**
     * Process the reward for a qualified referral
     */
    static async rewardReferral(historyId, io) {
        const history = await ReferralHistory.findById(historyId);
        if (!history) throw new Error("Referral history not found.");
        if (history.status !== 'Qualified') {
            throw new Error(`Cannot reward a referral that is ${history.status}`);
        }

        // 1. Credit the Referrer
        await WalletService.credit(
            history.referrerId,
            'Passenger', // Assuming Passenger for now, though this ecosystem is passenger-only
            history.reward,
            'ReferralBonus',
            { referredUserId: history.referredUserId, historyId: history._id }
        ).catch(err => console.error("Referral Wallet Credit Error:", err));

        // 2. Mark as Rewarded
        history.status = 'Rewarded';
        await history.save();

        // 3. Send Notification to Referrer
        await NotificationService.createNotification({
            userId: history.referrerId,
            title: 'Referral Reward Earned! ðŸŽ‰',
            description: `Your friend completed their first ride. ₹${history.reward} has been credited to your wallet.`,
            type: 'REFERRAL_REWARD',
            category: 'Wallet',
            icon: 'gift',
            actionUrl: `/dashboard/wallet`
        }, io).catch(err => console.error(err));

        // 4. Emit Socket Updates
        if (io) {
            io.emit(`referralUpdated_${history.referrerId}`);
            io.emit(`walletUpdated_${history.referrerId}`);
        }

        return history;
    }

    /**
     * Fetch referral summary dashboard data
     */
    static async getReferralDashboard(userId) {
        const codeDoc = await this.generateReferralCode(userId);
        
        // Aggregate stats
        const history = await ReferralHistory.find({ referrerId: userId });
        
        const stats = {
            totalInvites: history.length,
            pending: history.filter(h => h.status === 'Pending').length,
            qualified: history.filter(h => h.status === 'Qualified').length,
            rewarded: history.filter(h => h.status === 'Rewarded').length,
            totalEarned: history.filter(h => h.status === 'Rewarded').reduce((sum, h) => sum + h.reward, 0)
        };

        return { code: codeDoc, stats };
    }

    /**
     * Fetch detailed referral history
     */
    static async getReferralHistory(userId) {
        return await ReferralHistory.find({ referrerId: userId })
            .populate('referredUserId', 'name avatar') // Assuming user has name and avatar
            .sort({ createdAt: -1 });
    }

    // â”€â”€â”€ ADMIN REFERRALS & INCENTIVES (Sprint 27) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async adminGetReferralPrograms() {
        return await ReferralCode.find().populate('userId', 'name email').sort({ createdAt: -1 }).lean();
    }

    static async adminCreateReferralProgram(data, adminId, ipAddress) {
        const referral = new ReferralCode({
            userId: data.userId,
            code: data.code.toUpperCase(),
            rewardAmount: data.rewardAmount || 10.0,
            status: data.status || 'Active',
            maxUses: data.maxUses || 50,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            metadata: data.metadata || {}
        });
        await referral.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'CREATE_REFERRAL',
            targetType: 'ReferralCode',
            targetId: referral._id,
            details: { code: referral.code, rewardAmount: referral.rewardAmount },
            ipAddress
        });

        return referral;
    }

    static async adminUpdateReferralProgram(id, data, adminId, ipAddress) {
        const referral = await ReferralCode.findById(id);
        if (!referral) throw new Error('Referral program not found');

        const prevData = { code: referral.code, rewardAmount: referral.rewardAmount, status: referral.status };

        if (data.code !== undefined) referral.code = data.code.toUpperCase();
        if (data.rewardAmount !== undefined) referral.rewardAmount = data.rewardAmount;
        if (data.status !== undefined) referral.status = data.status;
        if (data.maxUses !== undefined) referral.maxUses = data.maxUses;
        if (data.expiresAt !== undefined) referral.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
        if (data.metadata !== undefined) referral.metadata = data.metadata;

        await referral.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'UPDATE_REFERRAL',
            targetType: 'ReferralCode',
            targetId: referral._id,
            details: { previous: prevData, updated: { code: referral.code, rewardAmount: referral.rewardAmount, status: referral.status } },
            ipAddress
        });

        return referral;
    }
}

module.exports = ReferralService;
