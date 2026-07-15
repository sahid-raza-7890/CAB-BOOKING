const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, index: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', index: true },
    
    type: { type: String, enum: ['Percentage', 'Flat'], required: true },
    value: { type: Number, required: true },
    maxDiscount: { type: Number },
    minFare: { type: Number, default: 0 },
    
    // Usage Caps
    maxGlobalUsage: { type: Number, default: null }, // Total times this coupon can be used across all users
    currentGlobalUsage: { type: Number, default: 0 },
    maxPerUserUsage: { type: Number, default: 1 }, // Times a single user can use it
    
    // Eligibility Constraints
    eligibleRideTypes: { type: [String], default: ['City', 'Inter City', 'Rental', 'Scheduled'] },
    eligibleVehicleTypes: { type: [String], default: ['Basic', 'SUV', 'Luxury'] },
    cityRestriction: { type: String, default: null },
    
    active: { type: Boolean, default: true },
    expiryDate: { type: Date, required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
