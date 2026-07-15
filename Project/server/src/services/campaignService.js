const Campaign = require('../models/Campaign');
const OfferRedemption = require('../models/OfferRedemption');

class CampaignService {
    
    static async getActiveCampaigns() {
        return await Campaign.find({ status: 'Active', endDate: { $gte: new Date() } });
    }
    /**
     * Records spend against a campaign budget
     */
    static async recordSpend(campaignId, amount) {
        if (!campaignId) return;
        
        await Campaign.findByIdAndUpdate(campaignId, { 
            $inc: { spend: amount } 
        });
    }

    /**
     * Get Analytics for a Campaign
     */
    static async getAnalytics(campaignId) {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) throw new Error('Campaign not found');

        const redemptions = await OfferRedemption.countDocuments({ campaignId });
        
        // normally we would join against Ride to find total revenue generated
        // for simplicity, we mock ROI based on spend
        const roi = campaign.spend > 0 ? (redemptions * 500) / campaign.spend : 0; 
        
        return {
            campaign,
            redemptions,
            roi: roi.toFixed(2)
        };
    }
}

module.exports = CampaignService;
