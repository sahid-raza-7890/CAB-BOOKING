const express = require('express');
const router = express.Router();
const AdminPromotionController = require('../controllers/adminPromotionController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Authenticated admins only
router.use(authMiddleware, requireRole('Admin'));

// Summary dashboard
router.get('/dashboard', AdminPromotionController.getDashboard);

// Promotions CRUD
router.get('/', AdminPromotionController.getPromotions);
router.post('/', AdminPromotionController.createPromotion);

// Coupons CRUD
router.get('/coupons', AdminPromotionController.getCoupons);
router.post('/coupons/bulk', AdminPromotionController.bulkCreateCoupons); // SPRINT 39
router.post('/coupons', AdminPromotionController.createCoupon);
router.put('/coupons/:id', AdminPromotionController.updateCoupon);
router.delete('/coupons/:id', AdminPromotionController.deleteCoupon);

// Referrals
router.get('/referrals', AdminPromotionController.getReferralPrograms);
router.post('/referrals', AdminPromotionController.createReferralProgram);
router.put('/referrals/:id', AdminPromotionController.updateReferralProgram);

// Driver incentives
router.get('/incentives', AdminPromotionController.getDriverIncentives);
router.post('/incentives', AdminPromotionController.createDriverIncentive);
router.put('/incentives/:id', AdminPromotionController.updateDriverIncentive);
router.put('/incentives/:id/enable', AdminPromotionController.enableDriverIncentive);
router.put('/incentives/:id/disable', AdminPromotionController.disableDriverIncentive);

// Analytics
router.get('/analytics', AdminPromotionController.getCampaignAnalytics);

// Dynamic :id routes (must be last)
router.get('/:id', AdminPromotionController.getPromotion);
router.put('/:id', AdminPromotionController.updatePromotion);
router.delete('/:id', AdminPromotionController.deletePromotion);
router.put('/:id/activate', AdminPromotionController.activatePromotion);
router.put('/:id/deactivate', AdminPromotionController.deactivatePromotion);

module.exports = router;
