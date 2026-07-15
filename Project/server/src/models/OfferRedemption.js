const mongoose = require('mongoose');

const offerRedemptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
    discountApplied: { type: Number, required: true },
    status: { type: String, enum: ['Redeemed', 'Refunded'], default: 'Redeemed' }
}, { timestamps: true });

// Prevent duplicate redemptions for a single ride
offerRedemptionSchema.index({ rideId: 1 }, { unique: true });

module.exports = mongoose.model('OfferRedemption', offerRedemptionSchema);
