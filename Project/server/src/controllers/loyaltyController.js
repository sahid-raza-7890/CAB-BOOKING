const RewardService = require('../services/rewardService');
const RewardHistory = require('../models/RewardHistory');
const ResponseFormatter = require('../utils/responseFormatter');

class LoyaltyController {
    static async getStatus(req, res) {
        const { userId } = req.user;
        const account = await RewardService.getOrCreateAccount(userId);
        return ResponseFormatter.success(res, { account });
    }

    static async getHistory(req, res) {
        const { userId } = req.user;
        const history = await RewardService.getHistory(userId);
        return ResponseFormatter.success(res, { history });
    }
}

module.exports = LoyaltyController;
