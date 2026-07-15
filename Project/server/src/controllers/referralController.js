const ReferralService = require('../services/referralService');
const ResponseFormatter = require('../utils/responseFormatter');

class ReferralController {
    
    static async getDashboard(req, res) {
        const { userId } = req.user;
        const dashboard = await ReferralService.getReferralDashboard(userId);
        return ResponseFormatter.success(res, dashboard);
    }

    static async getHistory(req, res) {
        const { userId } = req.user;
        const history = await ReferralService.getReferralHistory(userId);
        return ResponseFormatter.success(res, { history });
    }

    static async applyReferral(req, res) {
        const { userId } = req.user;
        const { code } = req.body;
        const io = req.app.get('io');
        
        const history = await ReferralService.applyReferral(userId, code, io);
        return ResponseFormatter.success(res, { history }, "Referral code applied successfully.");
    }

    static async shareReferral(req, res) {
        // In a real app this might send an email or SMS directly,
        // For now we just return a success message as the frontend handles standard sharing APIs.
        return ResponseFormatter.success(res, null, "Referral shared successfully.");
    }

    static async getCode(req, res) {
        const { userId } = req.user;
        const codeDoc = await ReferralService.generateReferralCode(userId);
        return ResponseFormatter.success(res, { code: codeDoc });
    }
}

module.exports = ReferralController;
