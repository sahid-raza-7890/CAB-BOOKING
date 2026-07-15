const IncentiveService = require('../services/incentiveService');
const ResponseFormatter = require('../utils/responseFormatter');

class DriverIncentiveController {
    static async getActiveIncentives(req, res) {
        const { userId } = req.user;
        const now = new Date();
        
        // Fetch globally active incentives
        const incentives = await IncentiveService.getActiveIncentives(now);

        // Fetch driver's claims so we can mark them as unlocked/claimed
        const history = await IncentiveService.getBonusHistory(userId);

        // Augment payload
        const payload = incentives.map(inc => {
            const h = history.find(hx => hx.incentiveId.toString() === inc._id.toString());
            return {
                ...inc.toObject(),
                claimed: !!h,
                claimedAt: h ? h.claimedAt : null
            };
        });

        return ResponseFormatter.success(res, { incentives: payload });
    }
}

module.exports = DriverIncentiveController;
