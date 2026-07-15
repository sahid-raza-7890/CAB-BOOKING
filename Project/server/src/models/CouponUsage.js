const mongoose = require('mongoose');

const couponUsageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    couponCode: { type: String, required: true },
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
    discountAmount: { type: Number, required: true },
    status: { type: String, enum: ['Applied', 'Redeemed', 'Failed'], default: 'Applied' }
}, { timestamps: true });

module.exports = mongoose.model('CouponUsage', couponUsageSchema);
