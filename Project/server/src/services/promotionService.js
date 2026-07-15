const Campaign = require('../models/Campaign');
const Offer = require('../models/Offer');
const AdminAuditService = require('./adminAuditService');

class PromotionService {
    static async adminGetPromotions() {
        return await Campaign.find().sort({ createdAt: -1 }).lean();
    }

    static async adminGetPromotion(id) {
        const campaign = await Campaign.findById(id).lean();
        if (!campaign) throw new Error('Promotion Campaign not found');
        const offers = await Offer.find({ campaignId: id }).lean();
        return { ...campaign, offers };
    }

    static async adminCreatePromotion(data, adminId, ipAddress) {
        const campaign = new Campaign({
            name: data.name,
            description: data.description,
            status: data.status || 'Draft',
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            budget: data.budget || 0,
            spend: 0,
            roi: 0,
            createdBy: adminId
        });
        await campaign.save();

        await AdminAuditService.logAction({
            adminId,
            action: 'CREATE_PROMOTION',
            targetType: 'Campaign',
            targetId: campaign._id,
            details: { name: campaign.name, budget: campaign.budget },
            ipAddress
        });

        return campaign;
    }

    static async adminUpdatePromotion(id, data, adminId, ipAddress) {
        const campaign = await Campaign.findById(id);
        if (!campaign) throw new Error('Promotion Campaign not found');

        const prevData = { name: campaign.name, budget: campaign.budget, status: campaign.status };

        if (data.name !== undefined) campaign.name = data.name;
        if (data.description !== undefined) campaign.description = data.description;
        if (data.status !== undefined) campaign.status = data.status;
        if (data.startDate !== undefined) campaign.startDate = new Date(data.startDate);
        if (data.endDate !== undefined) campaign.endDate = new Date(data.endDate);
        if (data.budget !== undefined) campaign.budget = data.budget;
        
        await campaign.save();

        await AdminAuditService.logAction({
            adminId,
            action: 'UPDATE_PROMOTION',
            targetType: 'Campaign',
            targetId: campaign._id,
            details: { previous: prevData, updated: { name: campaign.name, budget: campaign.budget, status: campaign.status } },
            ipAddress
        });

        return campaign;
    }

    static async adminDeletePromotion(id, adminId, ipAddress) {
        const campaign = await Campaign.findById(id);
        if (!campaign) throw new Error('Promotion Campaign not found');

        await Campaign.deleteOne({ _id: id });
        await Offer.deleteMany({ campaignId: id }); // Clean up related offers

        await AdminAuditService.logAction({
            adminId,
            action: 'DELETE_PROMOTION',
            targetType: 'Campaign',
            targetId: id,
            details: { name: campaign.name },
            ipAddress
        });

        return { id };
    }

    static async adminActivatePromotion(id, adminId, ipAddress) {
        const campaign = await Campaign.findById(id);
        if (!campaign) throw new Error('Promotion Campaign not found');

        campaign.status = 'Active';
        await campaign.save();

        await AdminAuditService.logAction({
            adminId,
            action: 'ACTIVATE_PROMOTION',
            targetType: 'Campaign',
            targetId: campaign._id,
            details: { name: campaign.name },
            ipAddress
        });

        return campaign;
    }

    static async adminDeactivatePromotion(id, adminId, ipAddress) {
        const campaign = await Campaign.findById(id);
        if (!campaign) throw new Error('Promotion Campaign not found');

        campaign.status = 'Paused';
        await campaign.save();

        await AdminAuditService.logAction({
            adminId,
            action: 'DEACTIVATE_PROMOTION',
            targetType: 'Campaign',
            targetId: campaign._id,
            details: { name: campaign.name },
            ipAddress
        });

        return campaign;
    }

    // â”€â”€â”€ ADMIN ANALYTICS (Sprint 29) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async adminPromotionAnalytics() {
        const Campaign = require('../models/Campaign');
        const Offer = require('../models/Offer');
        const [campaignsAgg, offersAgg] = await Promise.all([
            Campaign.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 }, totalBudget: { $sum: '$budget' }, totalSpend: { $sum: '$spend' } } }
            ]),
            Offer.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        const statuses = {};
        let activeBudget = 0;
        let activeSpend = 0;
        
        campaignsAgg.forEach(c => { 
            statuses[c._id] = c.count; 
            if(c._id === 'Active') {
                activeBudget += c.totalBudget;
                activeSpend += c.totalSpend;
            }
        });

        const offerStatuses = {};
        offersAgg.forEach(o => { offerStatuses[o._id] = o.count; });

        return {
            campaignsByStatus: statuses,
            offersByStatus: offerStatuses,
            activeBudget,
            activeSpend,
            averageROI: activeSpend > 0 ? ((activeBudget - activeSpend) / activeSpend * 100).toFixed(2) + '%' : '0%'
        };
    }
}

module.exports = PromotionService;
