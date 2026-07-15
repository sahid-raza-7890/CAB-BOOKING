const CouponService = require('../services/couponService');
const Coupon = require('../models/Coupon');
const ResponseFormatter = require('../utils/responseFormatter');

class CouponController {
    static async validateCoupon(req, res) {
        const { userId } = req.user;
        const { code, fare, rideType, vehicleType, city } = req.body;

        const { discountAmount, coupon } = await CouponService.validateAndCalculate(
            code, userId, fare, rideType, vehicleType, city
        );

        return ResponseFormatter.success(res, { discountAmount, couponId: coupon._id });
    }

    static async getAvailableCoupons(req, res) {
        const coupons = await CouponService.getAvailableCoupons();
        return ResponseFormatter.success(res, { coupons });
    }

    // â”€â”€â”€ SPRINT 39: COUPON COMPLETION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async applyCoupon(req, res) {
        const { userId } = req.user;
        const { code, fare, rideType, vehicleType, city } = req.body;
        const result = await CouponService.applyCoupon(code, userId, fare, rideType, vehicleType, city);
        return ResponseFormatter.success(res, result, 'Coupon applied successfully');
    }

    static async removeCoupon(req, res) {
        const { userId } = req.user;
        const { code } = req.params;
        const result = await CouponService.removeCoupon(userId, code);
        return ResponseFormatter.success(res, result, 'Coupon removed');
    }

    static async getCouponHistory(req, res) {
        const { userId } = req.user;
        const history = await CouponService.getCouponHistory(userId);
        return ResponseFormatter.success(res, { history });
    }
}

module.exports = CouponController;
