const LoyaltyAccount = require('../models/LoyaltyAccount');
const RewardHistory = require('../models/RewardHistory');

// Tiers and multipliers configured in code rather than hardcoded DB checks, easier to modify later
const TIERS = {
    Bronze: { min: 0, multiplier: 1.0 },
    Silver: { min: 1000, multiplier: 1.2 },
    Gold: { min: 5000, multiplier: 1.5 },
    Platinum: { min: 15000, multiplier: 2.0 },
    Diamond: { min: 50000, multiplier: 3.0 }
};

class RewardService {

    static async getOrCreateAccount(userId) {
        let account = await LoyaltyAccount.findOne({ userId });
        if (!account) {
            account = new LoyaltyAccount({ userId });
            await account.save();
        }
        return account;
    }

    static async getHistory(userId) {
        return await RewardHistory.find({ userId }).sort({ createdAt: -1 });
    }

    /**
     * Determines tier based on lifetime points
     */
    static _calculateTier(lifetimePoints) {
        if (lifetimePoints >= TIERS.Diamond.min) return 'Diamond';
        if (lifetimePoints >= TIERS.Platinum.min) return 'Platinum';
        if (lifetimePoints >= TIERS.Gold.min) return 'Gold';
        if (lifetimePoints >= TIERS.Silver.min) return 'Silver';
        return 'Bronze';
    }

    /**
     * Awards points for a completed ride.
     * Points = base calculation * membership multiplier * campaign multiplier
     */
    static async awardRidePoints(userId, rideId, fare, campaignMultiplier = 1.0) {
        const account = await this.getOrCreateAccount(userId);
        
        // Base points: 1 point per 10 rupees
        let basePoints = Math.floor(fare / 10);
        
        // Apply multipliers
        const tierMultiplier = TIERS[account.tier].multiplier;
        const totalEarned = Math.floor(basePoints * tierMultiplier * campaignMultiplier);

        // Update Account
        account.totalPoints += totalEarned;
        account.lifetimePoints += totalEarned;
        
        // Check for Tier Upgrade
        const newTier = this._calculateTier(account.lifetimePoints);
        let tierUpgraded = false;
        if (newTier !== account.tier) {
            account.tier = newTier;
            tierUpgraded = true;
        }
        await account.save();

        // Record History
        const history = new RewardHistory({
            userId,
            points: totalEarned,
            type: 'Earned',
            source: 'Ride',
            referenceId: rideId.toString(),
            description: `Earned from ride ${rideId.toString()}`
        });
        await history.save();

        return { account, pointsEarned: totalEarned, tierUpgraded };
    }

    /**
     * Admin or System manual point adjustment
     */
    static async adjustPoints(userId, points, type, source, description, referenceId = null) {
        const account = await this.getOrCreateAccount(userId);
        
        if (type === 'Redeemed' || type === 'Expired') {
            if (account.totalPoints < points) throw new Error('Insufficient points');
            account.totalPoints -= points;
        } else {
            account.totalPoints += points;
            account.lifetimePoints += points;
            account.tier = this._calculateTier(account.lifetimePoints);
        }

        await account.save();

        const history = new RewardHistory({
            userId,
            points,
            type,
            source,
            referenceId,
            description
        });
        await history.save();

        return account;
    }
}

module.exports = RewardService;
