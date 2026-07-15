const PromotionService = require('../services/promotionService');
const CouponService = require('../services/couponService');
const ReferralService = require('../services/referralService');
const IncentiveService = require('../services/incentiveService');
const ResponseFormatter = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

class AdminPromotionController {

    // GET /api/admin/promotions/dashboard
    static getDashboard = asyncWrapper(async (req, res) => {
        const analytics = await IncentiveService.adminGetCampaignAnalytics();
        return ResponseFormatter.successAdmin(res, analytics, 'Promotions dashboard summary retrieved successfully');
    });

    // GET /api/admin/promotions
    static getPromotions = asyncWrapper(async (req, res) => {
        const promotions = await PromotionService.adminGetPromotions();
        return ResponseFormatter.successAdmin(res, promotions, 'Promotion campaigns list retrieved successfully');
    });

    // GET /api/admin/promotions/:id
    static getPromotion = asyncWrapper(async (req, res) => {
        const promotion = await PromotionService.adminGetPromotion(req.params.id);
        return ResponseFormatter.successAdmin(res, promotion, 'Promotion campaign details retrieved successfully');
    });

    // POST /api/admin/promotions
    static createPromotion = asyncWrapper(async (req, res) => {
        const promotion = await PromotionService.adminCreatePromotion(req.body, req.user._id, req.ip);
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('promotionUpdated', { promotionId: promotion._id, action: 'Create' });
        }
        return ResponseFormatter.successAdmin(res, promotion, 'Promotion campaign created successfully');
    });

    // PUT /api/admin/promotions/:id
    static updatePromotion = asyncWrapper(async (req, res) => {
        const promotion = await PromotionService.adminUpdatePromotion(req.params.id, req.body, req.user._id, req.ip);
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('promotionUpdated', { promotionId: promotion._id, action: 'Update' });
        }
        return ResponseFormatter.successAdmin(res, promotion, 'Promotion campaign updated successfully');
    });

    // DELETE /api/admin/promotions/:id
    static deletePromotion = asyncWrapper(async (req, res) => {
        await PromotionService.adminDeletePromotion(req.params.id, req.user._id, req.ip);
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('promotionUpdated', { promotionId: req.params.id, action: 'Delete' });
        }
        return ResponseFormatter.successAdmin(res, { id: req.params.id }, 'Promotion campaign deleted successfully');
    });

    // PUT /api/admin/promotions/:id/activate
    static activatePromotion = asyncWrapper(async (req, res) => {
        const promotion = await PromotionService.adminActivatePromotion(req.params.id, req.user._id, req.ip);
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('promotionUpdated', { promotionId: promotion._id, action: 'Activate' });
        }
        return ResponseFormatter.successAdmin(res, promotion, 'Promotion campaign activated successfully');
    });

    // PUT /api/admin/promotions/:id/deactivate
    static deactivatePromotion = asyncWrapper(async (req, res) => {
        const promotion = await PromotionService.adminDeactivatePromotion(req.params.id, req.user._id, req.ip);
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('promotionUpdated', { promotionId: promotion._id, action: 'Deactivate' });
        }
        return ResponseFormatter.successAdmin(res, promotion, 'Promotion campaign deactivated successfully');
    });

    // GET /api/admin/promotions/coupons
    static getCoupons = asyncWrapper(async (req, res) => {
        const coupons = await CouponService.adminGetCoupons();
        return ResponseFormatter.successAdmin(res, coupons, 'Coupons list retrieved successfully');
    });

    // POST /api/admin/promotions/coupons
    static createCoupon = asyncWrapper(async (req, res) => {
        const coupon = await CouponService.adminCreateCoupon(req.body, req.user._id, req.ip);
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('couponUpdated', { couponId: coupon._id, action: 'Create' });
        }
        return ResponseFormatter.successAdmin(res, coupon, 'Coupon created successfully');
    });

    // PUT /api/admin/promotions/coupons/:id
    static updateCoupon = asyncWrapper(async (req, res) => {
        const coupon = await CouponService.adminUpdateCoupon(req.params.id, req.body, req.user._id, req.ip);
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('couponUpdated', { couponId: coupon._id, action: 'Update' });
        }
        return ResponseFormatter.successAdmin(res, coupon, 'Coupon updated successfully');
    });

    // DELETE /api/admin/promotions/coupons/:id
    static deleteCoupon = asyncWrapper(async (req, res) => {
        await CouponService.adminDeleteCoupon(req.params.id, req.user._id, req.ip);
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('couponUpdated', { couponId: req.params.id, action: 'Delete' });
        }
        return ResponseFormatter.successAdmin(res, { id: req.params.id }, 'Coupon deleted successfully');
    });

    // GET /api/admin/promotions/referrals
    static getReferralPrograms = asyncWrapper(async (req, res) => {
        const referrals = await ReferralService.adminGetReferralPrograms();
        return ResponseFormatter.successAdmin(res, referrals, 'Referral codes list retrieved successfully');
    });

    // POST /api/admin/promotions/referrals
    static createReferralProgram = asyncWrapper(async (req, res) => {
        const referral = await ReferralService.adminCreateReferralProgram(req.body, req.user._id, req.ip);
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('referralUpdated', { referralId: referral._id, action: 'Create' });
        }
        return ResponseFormatter.successAdmin(res, referral, 'Referral code program created successfully');
    });

    // PUT /api/admin/promotions/referrals/:id
    static updateReferralProgram = asyncWrapper(async (req, res) => {
        const referral = await ReferralService.adminUpdateReferralProgram(req.params.id, req.body, req.user._id, req.ip);
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('referralUpdated', { referralId: referral._id, action: 'Update' });
        }
        return ResponseFormatter.successAdmin(res, referral, 'Referral code program updated successfully');
    });

    // GET /api/admin/promotions/incentives
    static getDriverIncentives = asyncWrapper(async (req, res) => {
        const incentives = await IncentiveService.adminGetDriverIncentives();
        return ResponseFormatter.successAdmin(res, incentives, 'Driver incentives list retrieved successfully');
    });

    // POST /api/admin/promotions/incentives
    static createDriverIncentive = asyncWrapper(async (req, res) => {
        const incentive = await IncentiveService.adminCreateDriverIncentive(req.body, req.user._id, req.ip);
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('driverIncentiveUpdated', { incentiveId: incentive._id, action: 'Create' });
        }
        return ResponseFormatter.successAdmin(res, incentive, 'Driver incentive quest created successfully');
    });

    // PUT /api/admin/promotions/incentives/:id
    static updateDriverIncentive = asyncWrapper(async (req, res) => {
        const incentive = await IncentiveService.adminUpdateDriverIncentive(req.params.id, req.body, req.user._id, req.ip);
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('driverIncentiveUpdated', { incentiveId: incentive._id, action: 'Update' });
        }
        return ResponseFormatter.successAdmin(res, incentive, 'Driver incentive quest updated successfully');
    });

    // PUT /api/admin/promotions/incentives/:id/enable
    static enableDriverIncentive = asyncWrapper(async (req, res) => {
        const incentive = await IncentiveService.adminEnableDriverIncentive(req.params.id, req.user._id, req.ip);
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('driverIncentiveUpdated', { incentiveId: incentive._id, action: 'Enable' });
        }
        return ResponseFormatter.successAdmin(res, incentive, 'Driver incentive quest enabled successfully');
    });

    // PUT /api/admin/promotions/incentives/:id/disable
    static disableDriverIncentive = asyncWrapper(async (req, res) => {
        const incentive = await IncentiveService.adminDisableDriverIncentive(req.params.id, req.user._id, req.ip);
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('driverIncentiveUpdated', { incentiveId: incentive._id, action: 'Disable' });
        }
        return ResponseFormatter.successAdmin(res, incentive, 'Driver incentive quest disabled successfully');
    });

    // GET /api/admin/promotions/analytics
    static getCampaignAnalytics = asyncWrapper(async (req, res) => {
        const analytics = await IncentiveService.adminGetCampaignAnalytics();
        return ResponseFormatter.successAdmin(res, analytics, 'Campaigns performance report compiled successfully');
    });

    // â”€â”€â”€ SPRINT 39 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    // POST /api/admin/promotions/coupons/bulk
    static bulkCreateCoupons = asyncWrapper(async (req, res) => {
        const { count, ...data } = req.body;
        if (!count || count < 1) throw new Error('Count must be at least 1');
        
        const coupons = await CouponService.adminBulkCreateCoupons(data, count, req.user._id, req.ip);
        
        const io = req.app.get('io');
        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
        }
        return ResponseFormatter.successAdmin(res, coupons, `${count} coupons generated successfully`);
    });
}

module.exports = AdminPromotionController;
