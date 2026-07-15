const Campaign = require('../models/Campaign');
const CampaignService = require('../services/campaignService');
const ResponseFormatter = require('../utils/responseFormatter');

class CampaignController {
    static async getActiveCampaigns(req, res) {
        const campaigns = await CampaignService.getActiveCampaigns();
        return ResponseFormatter.success(res, { campaigns });
    }
}

module.exports = CampaignController;
