const Coupon = require('../models/Coupon');
const OfferRedemption = require('../models/OfferRedemption');
const Ride = require('../models/Ride');

class CouponService {

    /**
     * Fetch available active coupons
     */
    static async getAvailableCoupons() {
        return await Coupon.find({
            active: true,
            expiryDate: { $gte: new Date() }
        });
    }

    /**
     * Validates a coupon and returns the exact discount amount.
     */
    static async validateAndCalculate(couponCode, userId, fare, rideType, vehicleType, city) {
        const coupon = await Coupon.findOne({ code: couponCode, active: true });
        
        if (!coupon) throw new Error('Invalid or inactive coupon');
        
        if (new Date() > coupon.expiryDate) throw new Error('Coupon has expired');
        
        if (fare < coupon.minFare) throw new Error(`Minimum fare of â‚¹${coupon.minFare} required`);

        if (!coupon.eligibleRideTypes.includes(rideType)) throw new Error('Coupon not valid for this ride type');
        
        if (!coupon.eligibleVehicleTypes.includes(vehicleType)) throw new Error('Coupon not valid for this vehicle type');
        
        if (coupon.cityRestriction && coupon.cityRestriction !== city) throw new Error('Coupon not valid in your city');

        // Check global usage caps
        if (coupon.maxGlobalUsage !== null && coupon.currentGlobalUsage >= coupon.maxGlobalUsage) {
            throw new Error('Coupon usage limit reached');
        }

        // Check per-user usage caps
        const userUsageCount = await OfferRedemption.countDocuments({ couponId: coupon._id, userId });
        if (userUsageCount >= coupon.maxPerUserUsage) {
            throw new Error('You have already used this coupon the maximum number of times');
        }

        // Calculate discount safely on backend
        let discount = 0;
        if (coupon.type === 'Flat') {
            discount = coupon.value;
        } else if (coupon.type === 'Percentage') {
            discount = fare * (coupon.value / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        }

        // Discount cannot exceed the fare itself
        discount = Math.min(discount, fare);

        return { discountAmount: discount, coupon };
    }

    /**
     * Consumes the coupon by recording the redemption and bumping global usage.
     */
    static async redeem(couponCode, userId, rideId, discountApplied) {
        const coupon = await Coupon.findOne({ code: couponCode });
        if (!coupon) throw new Error('Coupon not found');

        const redemption = new OfferRedemption({
            userId,
            couponId: coupon._id,
            campaignId: coupon.campaignId,
            rideId,
            discountApplied
        });
        await redemption.save();

        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { currentGlobalUsage: 1 } });

        return redemption;
    }

    // â”€â”€â”€ ADMIN CAMPAIGNS & PROMOTIONS (Sprint 27) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async adminGetCoupons() {
        return await Coupon.find().populate('campaignId', 'name').sort({ createdAt: -1 }).lean();
    }

    static async adminCreateCoupon(data, adminId, ipAddress) {
        const coupon = new Coupon({
            code: data.code.toUpperCase(),
            campaignId: data.campaignId,
            type: data.type,
            value: data.value,
            maxDiscount: data.maxDiscount,
            minFare: data.minFare || 0,
            maxGlobalUsage: data.maxGlobalUsage,
            currentGlobalUsage: 0,
            maxPerUserUsage: data.maxPerUserUsage || 1,
            eligibleRideTypes: data.eligibleRideTypes || ['City', 'Inter City', 'Rental', 'Scheduled'],
            eligibleVehicleTypes: data.eligibleVehicleTypes || ['Basic', 'SUV', 'Luxury'],
            cityRestriction: data.cityRestriction,
            active: data.active !== undefined ? data.active : true,
            expiryDate: new Date(data.expiryDate)
        });
        await coupon.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'CREATE_COUPON',
            targetType: 'Coupon',
            targetId: coupon._id,
            details: { code: coupon.code, value: coupon.value },
            ipAddress
        });

        return coupon;
    }

    static async adminUpdateCoupon(id, data, adminId, ipAddress) {
        const coupon = await Coupon.findById(id);
        if (!coupon) throw new Error('Coupon not found');

        const prevData = { code: coupon.code, value: coupon.value, active: coupon.active };

        if (data.code !== undefined) coupon.code = data.code.toUpperCase();
        if (data.campaignId !== undefined) coupon.campaignId = data.campaignId;
        if (data.type !== undefined) coupon.type = data.type;
        if (data.value !== undefined) coupon.value = data.value;
        if (data.maxDiscount !== undefined) coupon.maxDiscount = data.maxDiscount;
        if (data.minFare !== undefined) coupon.minFare = data.minFare;
        if (data.maxGlobalUsage !== undefined) coupon.maxGlobalUsage = data.maxGlobalUsage;
        if (data.maxPerUserUsage !== undefined) coupon.maxPerUserUsage = data.maxPerUserUsage;
        if (data.eligibleRideTypes !== undefined) coupon.eligibleRideTypes = data.eligibleRideTypes;
        if (data.eligibleVehicleTypes !== undefined) coupon.eligibleVehicleTypes = data.eligibleVehicleTypes;
        if (data.cityRestriction !== undefined) coupon.cityRestriction = data.cityRestriction;
        if (data.active !== undefined) coupon.active = data.active;
        if (data.expiryDate !== undefined) coupon.expiryDate = new Date(data.expiryDate);

        await coupon.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'UPDATE_COUPON',
            targetType: 'Coupon',
            targetId: coupon._id,
            details: { previous: prevData, updated: { code: coupon.code, value: coupon.value, active: coupon.active } },
            ipAddress
        });

        return coupon;
    }

    static async adminDeleteCoupon(id, adminId, ipAddress) {
        const coupon = await Coupon.findById(id);
        if (!coupon) throw new Error('Coupon not found');

        await Coupon.deleteOne({ _id: id });

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'DELETE_COUPON',
            targetType: 'Coupon',
            targetId: id,
            details: { code: coupon.code },
            ipAddress
        });

        return { id };
    }

    // â”€â”€â”€ SPRINT 39: COUPON COMPLETION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async applyCoupon(couponCode, userId, fare, rideType, vehicleType, city) {
        const { discountAmount, coupon } = await this.validateAndCalculate(couponCode, userId, fare, rideType, vehicleType, city);
        
        const CouponUsage = require('../models/CouponUsage');

        // Check if there's already an active applied coupon for this user that hasn't been redeemed
        const existing = await CouponUsage.findOne({ userId, status: 'Applied' });
        if (existing) {
            // Remove the old one, we only allow one applied coupon at a time
            await CouponUsage.deleteOne({ _id: existing._id });
        }

        const usage = new CouponUsage({
            userId,
            couponCode: coupon.code,
            discountAmount,
            status: 'Applied'
        });
        await usage.save();

        return { usage, discountAmount };
    }

    static async removeCoupon(userId, couponCode) {
        const CouponUsage = require('../models/CouponUsage');
        const usage = await CouponUsage.findOne({ userId, couponCode, status: 'Applied' });
        if (!usage) throw new Error('Coupon not found or already redeemed');
        
        await CouponUsage.deleteOne({ _id: usage._id });
        return { success: true };
    }

    static async getCouponHistory(userId) {
        const CouponUsage = require('../models/CouponUsage');
        return await CouponUsage.find({ userId }).sort({ createdAt: -1 }).lean();
    }

    static async adminBulkCreateCoupons(data, count, adminId, ipAddress) {
        const prefix = data.codePrefix ? data.codePrefix.toUpperCase() : 'CPN';
        const newCoupons = [];

        for (let i = 0; i < count; i++) {
            const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
            const code = `${prefix}-${randomString}`;
            
            newCoupons.push({
                code,
                campaignId: data.campaignId,
                type: data.type,
                value: data.value,
                maxDiscount: data.maxDiscount,
                minFare: data.minFare || 0,
                maxGlobalUsage: data.maxGlobalUsage,
                currentGlobalUsage: 0,
                maxPerUserUsage: data.maxPerUserUsage || 1,
                eligibleRideTypes: data.eligibleRideTypes || ['City', 'Inter City', 'Rental', 'Scheduled'],
                eligibleVehicleTypes: data.eligibleVehicleTypes || ['Basic', 'SUV', 'Luxury'],
                cityRestriction: data.cityRestriction,
                active: data.active !== undefined ? data.active : true,
                expiryDate: new Date(data.expiryDate)
            });
        }

        const inserted = await Coupon.insertMany(newCoupons);

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'BULK_CREATE_COUPONS',
            targetType: 'Coupon',
            targetId: adminId, // No single target
            details: { count, prefix, value: data.value },
            ipAddress
        });

        return inserted;
    }
}

module.exports = CouponService;
