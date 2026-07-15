const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/couponController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/validate', authMiddleware, asyncWrapper(CouponController.validateCoupon));
router.get('/available', authMiddleware, asyncWrapper(CouponController.getAvailableCoupons));

// â”€â”€â”€ SPRINT 39 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/apply', authMiddleware, asyncWrapper(CouponController.applyCoupon));
router.delete('/:code', authMiddleware, asyncWrapper(CouponController.removeCoupon));
router.get('/history', authMiddleware, asyncWrapper(CouponController.getCouponHistory));

module.exports = router;
